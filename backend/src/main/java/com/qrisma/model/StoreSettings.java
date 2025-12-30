package com.qrisma.model;

import jakarta.persistence.*;

@Entity
@Table(name = "store_settings")
public class StoreSettings {
    @Id
    private Long id;

    @Column(nullable = false)
    private String storeName;

    @Column(length = 1000)
    private String description;

    @Column
    private String email;

    @Column
    private String phone;

    @Column
    private String address;

    @Column
    private String website;

    public StoreSettings() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}
