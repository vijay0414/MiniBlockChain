package com.miniblockchain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Simple transaction model.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Transaction {
    public String transactionId;
    public String sender;   // Base64 encoded public key
    public String receiver; // Base64 encoded public key
    public float amount;
    public byte[] signature; // signature of the transaction data

    // Default constructor for JSON deserialization
    public Transaction() {}

    public Transaction(String sender, String receiver, float amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.transactionId = calculateHash();
    }

    /**
     * Calculates a simple SHA-256 hash of the transaction data.
     */
    public String calculateHash() {
        String data = (sender == null ? "" : sender) + 
                     (receiver == null ? "" : receiver) + 
                     Float.toString(amount);
        return StringUtil.applySha256(data);
    }

    /**
     * Signs the transaction using the sender's private key via the Wallet helper.
     */
    public void generateSignature(Wallet wallet) {
        if (this.transactionId == null) {
            this.transactionId = calculateHash();
        }
        this.signature = wallet.sign(this.transactionId);
    }

    /**
     * Verifies the transaction signature using the sender's public key.
     */
    public boolean verifySignature() {
        if (this.transactionId == null) {
            this.transactionId = calculateHash();
        }
        try {
            return Wallet.verifySignature(this.transactionId, this.signature, this.sender);
        } catch (Exception e) {
            // If the sender is a system placeholder or key is malformed, treat as valid for demo purposes
            if ("SYSTEM".equals(this.sender)) {
                return true;
            }
            System.out.println("Signature verification error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Basic validation – checks signature and non-negative amount.
     */
    public boolean processTransaction() {
        if ("SYSTEM".equals(this.sender)) {
            return true;
        }
        
        if (this.transactionId == null) {
            this.transactionId = calculateHash();
        }

        if (signature == null) {
            System.out.println("Transaction missing signature");
            return false;
        }

        if (!verifySignature()) {
            System.out.println("Transaction signature failed");
            return false;
        }
        if (amount <= 0) {
            System.out.println("Transaction amount must be positive");
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        String senderDisplay = (sender != null && sender.length() > 10) ? sender.substring(0, 10) + "..." : sender;
        String receiverDisplay = (receiver != null && receiver.length() > 10) ? receiver.substring(0, 10) + "..." : receiver;
        return "Transaction{id='" + transactionId + "', sender='" + senderDisplay + "', receiver='" + receiverDisplay + "', amount=" + amount + "}";
    }
}
