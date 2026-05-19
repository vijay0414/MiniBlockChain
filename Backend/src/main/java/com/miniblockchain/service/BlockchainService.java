package com.miniblockchain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miniblockchain.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class BlockchainService {
    private Blockchain blockchain;
    private List<Transaction> pendingTransactions;
    private Wallet minerWallet;
    private int difficulty = 5;
    //The SYSTEM transaction represents the mining reward mechanism used to incentivize miners in Proof-of-Work blockchains.Because there is no central authority in a decentralized system to so it provide 50 bitcoins automatically at every transaction
    private float miningReward = 50f;
    private final String CHAIN_FILE = "blockchain_data.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BlockchainService() {
        this.pendingTransactions = new ArrayList<>();
        this.minerWallet = new Wallet();
    }

    @PostConstruct
    public void init() {
        loadChain();
        System.out.println("System Miner Wallet Initialized: " + minerWallet.getPublicKeyString());
    }

    public synchronized List<Block> getChain() {
        return blockchain.getChain();
    }

    public synchronized List<Transaction> getPendingTransactions() {
        return new ArrayList<>(pendingTransactions);
    }

    public synchronized boolean addTransaction(Transaction tx) {
        // Basic validation
        if (tx == null || tx.sender == null || tx.receiver == null || tx.amount <= 0) {
            return false;
        }
        
        // In a real system, we'd verify the signature properly.
        // For this demo, we trust transactions added via API if they pass processTransaction
        if (tx.processTransaction()) {
            pendingTransactions.add(tx);
            return true;
        }
        return false;
    }

    public synchronized Block minePendingTransactions(String minerAddress) {
        // Add mining reward transaction
        Transaction rewardTx = new Transaction("SYSTEM", minerAddress, miningReward);
        pendingTransactions.add(rewardTx);

        // Create new block
        String previousHash = blockchain.getChain().get(blockchain.getChain().size() - 1).hash;
        Block newBlock = new Block(previousHash);
        
        // Add all pending transactions to the block
        for (Transaction tx : pendingTransactions) {
            newBlock.addTransaction(tx);
        }
        
        // Mine and add to chain
        blockchain.addBlock(newBlock);
        
        // Clear pending transactions
        pendingTransactions = new ArrayList<>();
        
        // Save state
        saveChain();
        
        return newBlock;
    }

    public synchronized boolean isChainValid() {
        return blockchain.isChainValid();
    }

    public float getBalance(String address) {
        float balance = 0;
        for (Block block : blockchain.getChain()) {
            for (Transaction tx : block.transactions) {
                if (address.equals(tx.receiver)) {
                    balance += tx.amount;
                }
                if (address.equals(tx.sender)) {
                    balance -= tx.amount;
                }
            }
        }
        return balance;
    }

    public Wallet getMinerWallet() {
        return minerWallet;
    }

    private void saveChain() {
        try {
            objectMapper.writeValue(new File(CHAIN_FILE), blockchain);
            System.out.println("Blockchain saved to " + CHAIN_FILE);
        } catch (IOException e) {
            System.err.println("Error saving blockchain: " + e.getMessage());
        }
    }

    private void loadChain() {
        File file = new File(CHAIN_FILE);
        if (file.exists()) {
            try {
                this.blockchain = objectMapper.readValue(file, Blockchain.class);
                System.out.println("Blockchain loaded from " + CHAIN_FILE);
            } catch (IOException e) {
                System.err.println("Error loading blockchain, creating new one: " + e.getMessage());
                this.blockchain = new Blockchain(difficulty);
            }
        } else {
            System.out.println("No existing chain found. Initializing new blockchain.");
            this.blockchain = new Blockchain(difficulty);
        }
    }
}
