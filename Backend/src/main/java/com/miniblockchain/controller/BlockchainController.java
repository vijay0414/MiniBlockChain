package com.miniblockchain.controller;

import com.miniblockchain.model.Block;
import com.miniblockchain.model.Transaction;
import com.miniblockchain.model.Wallet;
import com.miniblockchain.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/chain")
    public List<Block> getChain() {
        return blockchainService.getChain();
    }

    @PostMapping("/transaction")
    public ResponseEntity<String> addTransaction(@RequestBody Transaction transaction) {
        if (transaction.sender == null || transaction.receiver == null || transaction.amount <= 0) {
            return ResponseEntity.badRequest().body("Invalid Transaction: Missing sender/receiver or amount <= 0.");
        }
        
        if (!"SYSTEM".equals(transaction.sender) && transaction.signature == null) {
             return ResponseEntity.badRequest().body("Invalid Transaction: Missing signature. For testing without signatures, use 'SYSTEM' as the sender.");
        }

        if (blockchainService.addTransaction(transaction)) {
            return ResponseEntity.ok("Transaction added to pending pool.");
        } else {
            return ResponseEntity.badRequest().body("Invalid Transaction: Signature verification failed or logic error.");
        }
    }

    @GetMapping("/transaction/sample")
    public ResponseEntity<Transaction> getSampleTransaction() {
        // Returns a sample SYSTEM transaction that works without a signature
        Transaction tx = new Transaction("SYSTEM", "UserPublicKeyHere", 100.0f);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/transaction")
    public List<Transaction> getPendingTransactions() {
        return blockchainService.getPendingTransactions();
    }

    @GetMapping("/mine")
    public ResponseEntity<Block> mine(@RequestParam String minerAddress) {
        Block newBlock = blockchainService.minePendingTransactions(minerAddress);
        return ResponseEntity.ok(newBlock);
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable String address) {
        float balance = blockchainService.getBalance(address);
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("balance", balance);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalanceQuery(@RequestParam String address) {
        float balance = blockchainService.getBalance(address);
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("balance", balance);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate() {
        boolean isValid = blockchainService.isChainValid();
        return ResponseEntity.ok(Map.of("isValid", isValid));
    }

    @GetMapping("/wallet/new")
    public ResponseEntity<Map<String, String>> createWallet() {
        Wallet wallet = new Wallet();
        Map<String, String> response = new HashMap<>();
        response.put("publicKey", wallet.getPublicKeyString());
        response.put("privateKey", wallet.getPrivateKeyString()); // Shared only for demo/testing
        return ResponseEntity.ok(response);
    }

    @PostMapping("/wallet/sign")
    public ResponseEntity<Map<String, String>> signTransaction(@RequestBody Map<String, Object> request) {
        try {
            String sender = (String) request.get("sender");
            String receiver = (String) request.get("receiver");
            float amount = ((Number) request.get("amount")).floatValue();
            String privateKey = (String) request.get("privateKey");

            // 1. Recreate transaction to get the hash (transactionId)
            Transaction tempTx = new Transaction(sender, receiver, amount);
            
            // 2. Sign the transaction ID using the private key
            byte[] signatureBytes = Wallet.sign(tempTx.transactionId, privateKey);
            String signatureBase64 = java.util.Base64.getEncoder().encodeToString(signatureBytes);

            Map<String, String> response = new HashMap<>();
            response.put("transactionId", tempTx.transactionId);
            response.put("signature", signatureBase64);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/miner/public-key")
    public ResponseEntity<String> getMinerPublicKey() {
        return ResponseEntity.ok(blockchainService.getMinerWallet().getPublicKeyString());
    }
}
