package com.miniblockchain.model;

import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Wallet {
    private PrivateKey privateKey;
    private PublicKey publicKey;

    public Wallet() {
        generateKeyPair();
    }

    public void generateKeyPair() {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair keyPair = keyGen.generateKeyPair();
            // Set the public and private keys from the keyPair
            privateKey = keyPair.getPrivate();
            publicKey = keyPair.getPublic();
        } catch(Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String getPublicKeyString() {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    public String getPrivateKeyString() {
        return Base64.getEncoder().encodeToString(privateKey.getEncoded());
    }

public static byte[] sign(String data, String privateKeyString) {
    try {
        String cleanKey = privateKeyString.trim(); 
        byte[] privateBytes = Base64.getDecoder().decode(cleanKey);
        
        java.security.spec.PKCS8EncodedKeySpec keySpec = new java.security.spec.PKCS8EncodedKeySpec(privateBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privKey = keyFactory.generatePrivate(keySpec);

        Signature rsa = Signature.getInstance("SHA256withRSA");
        rsa.initSign(privKey);
        rsa.update(data.getBytes());
        return rsa.sign();
    } catch (java.security.spec.InvalidKeySpecException e) {
        throw new RuntimeException("Signing failed: Invalid Key Format. Are you sure this is a Private Key?");
    } catch (Exception e) {
        throw new RuntimeException("Signing failed: " + e.getMessage());
    }
}

    public byte[] sign(String data) {
        Signature rsa;
        byte[] output = new byte[0];
        try {
            rsa = Signature.getInstance("SHA256withRSA");
            rsa.initSign(privateKey);
            byte[] strByte = data.getBytes();
            rsa.update(strByte);
            byte[] realSig = rsa.sign();
            output = realSig;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return output;
    }

    public static boolean verifySignature(String data, byte[] signature, String publicKeyString) {
        try {
            byte[] publicBytes = Base64.getDecoder().decode(publicKeyString);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey pubKey = keyFactory.generatePublic(keySpec);
            
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(pubKey);
            sig.update(data.getBytes());
            return sig.verify(signature);
        } catch (Exception e) {
            // Check for special system sender
            if ("SYSTEM".equals(publicKeyString)) return true;
            throw new RuntimeException(e);
        }
    }
}
