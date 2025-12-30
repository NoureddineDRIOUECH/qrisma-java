# Google Wallet integration (notes)

To enable "Add to Google Wallet" for loyalty passes:

1. Create Google Cloud project and enable Google Wallet API.
2. Create an issuer in the Google Wallet console and note the `issuerId`.
3. Create a service account with Wallet Objects Admin rights and download the JSON key.
4. For local testing, set the service account JSON into environment variable `GOOGLE_SERVICE_ACCOUNT_JSON` (or mount file into container and read file content).
   - We expect `google.wallet.serviceAccountJson` to be populated with that JSON (or adapt the GoogleWalletService to read a file path).
5. In production, store the JSON securely (secret manager) and never commit it.

The `GoogleWalletService.createSaveJwt` currently returns a placeholder. Replace with code to:

- Build the class and object payloads per Google docs.
- Sign the JWT with the service account private key using RS256.
- Return the compact JWT string to the frontend.
- Alternatively, call the Wallet API to insert objects and return Add-to-Wallet URL.

Google docs:

- https://developers.google.com/wallet
