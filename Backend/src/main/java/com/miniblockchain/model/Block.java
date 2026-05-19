package com.miniblockchain.model;

import java.util.ArrayList;
import java.util.Date;

public class Block {
    public String hash;
    public String previousHash;
    public String merkleRoot;
    public ArrayList<Transaction> transactions = new ArrayList<Transaction>();
    private long timeStamp;
    private int nonce;

    // Default constructor for JSON deserialization
    public Block() {}

    // Constructor for Block
    public Block(String previousHash) {
        this.previousHash = previousHash;
        this.timeStamp = new Date().getTime();
        this.hash = calculateHash();
    }

    // Calculate new hash based on block contents
    public String calculateHash() {
        String input = previousHash + Long.toString(timeStamp) + Integer.toString(nonce) + merkleRoot;
        return StringUtil.applySha256(input);
    }

    // Mine block with difficulty
    public void mineBlock(int difficulty) {
        merkleRoot = StringUtil.getMerkleRoot(transactions);
        String target = new String(new char[difficulty]).replace('\0', '0');
        while (!hash.substring(0, difficulty).equals(target)) {
            nonce++;
            hash = calculateHash();
        }
        System.out.println("Block Mined!!! : " + hash);
    }

    // Add transactions to this block
    public boolean addTransaction(Transaction transaction) {
        // Process transaction and check if valid, unless block is genesis block then ignore.
        if (transaction == null) return false;
        if ((!previousHash.equals("0"))) {
            if ((!transaction.processTransaction())) {
                System.out.println("Transaction failed to process. Discarded.");
                return false;
            }
        }
        transactions.add(transaction);
        System.out.println("Transaction Successfully added to Block");
        return true;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Block {\n");
        sb.append("  hash='").append(hash).append("'\n");
        sb.append("  previousHash='").append(previousHash).append("'\n");
        sb.append("  merkleRoot='").append(merkleRoot).append("'\n");
        sb.append("  transactions=[\n");
        for (Transaction tx : transactions) {
            sb.append("    ").append(tx.toString()).append("\n");
        }
        sb.append("  ]\n");
        sb.append("  timeStamp=").append(timeStamp).append("\n");
        sb.append("  nonce=").append(nonce).append("\n");
        sb.append("}");
        return sb.toString();
    }
}
