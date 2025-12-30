package com.qrisma.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.qrisma.model.Customer;
import com.qrisma.model.LoyaltyProgram;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPrivateKey;
import java.util.*;

@Service
public class GoogleWalletService {

  @Value("${google.wallet.serviceAccountJson:}")
  private String serviceAccountJson;

  @Value("${google.wallet.issuerId:}")
  public String issuerId;

  private ServiceAccountCredentials credentials;
  private final ObjectMapper objectMapper = new ObjectMapper();

  @PostConstruct
  public void init() throws Exception {
    if (serviceAccountJson == null || serviceAccountJson.isEmpty()) {
      System.err.println("WARN: Google Wallet service account JSON not configured");
      return;
    }
    // Load credentials from JSON string
    credentials = (ServiceAccountCredentials) GoogleCredentials
        .fromStream(new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8)))
        .createScoped(List.of("https://www.googleapis.com/auth/wallet_object.issuer"));

    System.out.println("Google Wallet service initialized with issuer: " + issuerId);
  }

  /**
   * Create a signed JWT for "Add to Google Wallet" flow.
   */
  public String createSaveJwt(Customer customer, LoyaltyProgram program) {
    if (credentials == null) {
      System.err.println("WARN: No valid service account credentials, returning placeholder JWT");
      return "PLACEHOLDER_JWT_CONFIGURE_GOOGLE_WALLET";
    }

    try {
      String classId = String.format("%s.%s", issuerId,
          program.getId().toString().replace("-", "_"));
      String objectId = String.format("%s.%s", issuerId,
          customer.getId().toString().replace("-", "_"));

      // Build a loyalty class mirroring Google sample (localized names, colors, hero)
      Map<String, Object> loyaltyClass = new HashMap<>();
      loyaltyClass.put("id", classId);
      loyaltyClass.put("reviewStatus", "UNDER_REVIEW");

      Map<String, Object> issuerNameVal = new HashMap<>();
      issuerNameVal.put("language", "en-US");
      issuerNameVal.put("value", "QRisma Store");
      Map<String, Object> issuerNameLoc = new HashMap<>();
      issuerNameLoc.put("defaultValue", issuerNameVal);
      loyaltyClass.put("localizedIssuerName", issuerNameLoc);

      Map<String, Object> programNameVal = new HashMap<>();
      programNameVal.put("language", "en-US");
      programNameVal.put("value", program.getName());
      Map<String, Object> programNameLoc = new HashMap<>();
      programNameLoc.put("defaultValue", programNameVal);
      loyaltyClass.put("localizedProgramName", programNameLoc);

      loyaltyClass.put("hexBackgroundColor", "#72461d");

      Map<String, Object> logoUri = new HashMap<>();
      logoUri.put("uri",
          "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=660&h=660");
      Map<String, Object> logoDescVal = new HashMap<>();
      logoDescVal.put("language", "en-US");
      logoDescVal.put("value", "LOGO_IMAGE_DESCRIPTION");
      Map<String, Object> logoDescLoc = new HashMap<>();
      logoDescLoc.put("defaultValue", logoDescVal);
      Map<String, Object> logoImage = new HashMap<>();
      logoImage.put("sourceUri", logoUri);
      logoImage.put("contentDescription", logoDescLoc);
      loyaltyClass.put("programLogo", logoImage);

      Map<String, Object> heroUri = new HashMap<>();
      heroUri.put("uri",
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1032&h=336");
      Map<String, Object> heroDescVal = new HashMap<>();
      heroDescVal.put("language", "en-US");
      heroDescVal.put("value", "HERO_IMAGE_DESCRIPTION");
      Map<String, Object> heroDescLoc = new HashMap<>();
      heroDescLoc.put("defaultValue", heroDescVal);
      Map<String, Object> heroImage = new HashMap<>();
      heroImage.put("sourceUri", heroUri);
      heroImage.put("contentDescription", heroDescLoc);
      loyaltyClass.put("heroImage", heroImage);

      // Build the loyalty object (minimal per sample)
      Map<String, Object> loyaltyObject = new HashMap<>();
      loyaltyObject.put("id", objectId);
      loyaltyObject.put("classId", classId);
      loyaltyObject.put("state", "ACTIVE");

      // QR code value = object ID so employee can scan and lookup
      Map<String, Object> barcode = new HashMap<>();
      barcode.put("type", "QR_CODE");
      barcode.put("value", objectId);
      barcode.put("alternateText", "");
      loyaltyObject.put("barcode", barcode);

      // Loyalty points with localized label per sample
      Map<String, Object> balance = new HashMap<>();
      balance.put("int", customer.getBalance());
      Map<String, Object> lpLabelVal = new HashMap<>();
      lpLabelVal.put("language", "en-US");
      lpLabelVal.put("value", "Reward Points");
      Map<String, Object> lpLabelLoc = new HashMap<>();
      lpLabelLoc.put("defaultValue", lpLabelVal);
      Map<String, Object> loyaltyPoints = new HashMap<>();
      loyaltyPoints.put("balance", balance);
      loyaltyPoints.put("localizedLabel", lpLabelLoc);
      loyaltyObject.put("loyaltyPoints", loyaltyPoints);

      // Create JWT claims
      Map<String, Object> claims = new HashMap<>();
      claims.put("iss", credentials.getClientEmail());
      claims.put("aud", "google");
      // Allow local dev origins (Vite defaults to :5173). Add https variants in case
      // dev server uses HTTPS.
      claims.put("origins", List.of(
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://localhost:5173",
          "https://127.0.0.1:5173"));
      claims.put("typ", "savetowallet");

      // Payload with both class and object (creates if not exists)
      Map<String, Object> payload = new HashMap<>();
      payload.put("loyaltyClasses", List.of(loyaltyClass));
      payload.put("loyaltyObjects", List.of(loyaltyObject));
      claims.put("payload", payload);

      // Sign with service account private key
      Algorithm algorithm = Algorithm.RSA256(null, (RSAPrivateKey) credentials.getPrivateKey());
      String token = JWT.create().withPayload(claims).sign(algorithm);

      System.out.println("Generated JWT for customer: " + customer.getId());
      return token;

    } catch (Exception e) {
      System.err.println("Error creating JWT: " + e.getMessage());
      e.printStackTrace();
      return "ERROR_CREATING_JWT";
    }
  }

  /**
   * Update object balance via Google Wallet REST API.
   * Note: For MVP we skip this - would need REST client to PATCH the object.
   */
  public void updateObjectBalance(String objectId, int newBalance, List<Map<String, Object>> textModulesData) {
    if (credentials == null) {
      System.err.println("WARN: Cannot update wallet object without credentials");
      return;
    }

    try {
      credentials.refreshIfExpired();
      String accessToken = credentials.getAccessToken().getTokenValue();

      String url = String.format("https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/%s", objectId);

      Map<String, Object> payloadMap = new HashMap<>();
      Map<String, Object> lpBalance = new HashMap<>();
      lpBalance.put("int", newBalance);
      Map<String, Object> lp = new HashMap<>();
      lp.put("balance", lpBalance);
      payloadMap.put("loyaltyPoints", lp);
      if (textModulesData != null && !textModulesData.isEmpty()) {
        payloadMap.put("textModulesData", textModulesData);
      }
      String payload = objectMapper.writeValueAsString(payloadMap);
      System.out.println("Updated wallet object for " + objectId + " -> balance=" + newBalance);

      java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
      java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
          .uri(java.net.URI.create(url))
          .header("Authorization", "Bearer " + accessToken)
          .header("Content-Type", "application/json")
          .method("PATCH", java.net.http.HttpRequest.BodyPublishers.ofString(payload))
          .build();

      java.net.http.HttpResponse<String> response = client.send(request,
          java.net.http.HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() >= 200 && response.statusCode() < 300) {
        System.out.println("Updated wallet balance for " + objectId + " -> " + newBalance);
      } else {
        System.err.println("Failed to update wallet object " + objectId + ": status=" + response.statusCode() + " body="
            + response.body());
      }

    } catch (Exception e) {
      System.err.println("Error updating wallet object " + objectId + ": " + e.getMessage());
    }
  }
}
