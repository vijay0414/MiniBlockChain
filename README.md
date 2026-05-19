# BlockMint - Decentralized Sandbox Explorer

BlockMint (MiniBlockchain) is a complete full-stack blockchain sandbox environment. It is designed to make the fundamental mechanics of block-mining, key-pair cryptographic signing, and ledger consensus highly visual, elegant, and interactive.

![BlockMint UI](frontend/public/favicon.svg) *(Note: Imagine a sleek Vantablack glassmorphism UI here)*

##  Features

###  Core Blockchain (Backend)
- **Proof-of-Work Mining**: Implements SHA-256 cryptographic puzzle solving with adjustable difficulty (nonce).
- **Asymmetric Cryptography**: Uses **RSA-2048** key pairs for wallet generation.
- **Digital Signatures**: Secures transactions using `SHA256withRSA` to prevent tampering and spoofing.
- **Local Persistence**: Saves the blockchain state seamlessly into a `blockchain_data.json` file.
- **RESTful API**: Exposes endpoints for mining, mempool management, transaction broadcasting, and ledger validation using **Java Spring Boot**.

###  Visual Explorer (Frontend)
- **Vantablack UI**: A highly premium dark mode interface with glassmorphic cards and neon accents.
- **Wallet Hub**: Instantly generate keys, inspect balances, and view auto-generated QR codes.
- **Cryptographic Payments**: Send BCOINS seamlessly. Features a `SYSTEM` minting sandbox mode and automatic signature generation for standard peer-to-peer transfers.
- **Interactive Mempool**: View pending transactions queued for the next block.
- **Scrollable Ledger**: A horizontal, interactive block explorer that decodes and displays full block manifests, transactions, and Merkle roots.
- **Integrity Monitor**: Real-time validation badges (✔ Valid / ✘ Tampered) based on hash verification.

---

##  Tech Stack

**Backend:**
- Java 17+
- Spring Boot 3.x
- Maven
- Jackson (JSON serialization)
- Java `java.security` (RSA, SHA-256)

**Frontend:**
- React 18
- Vite
- Tailwind CSS v4
- Axios
- Lucide React (Icons)
- Framer Motion (Animations)

---

##  Getting Started

### 1. Start the Spring Boot Backend
Ensure you have Java 17+ and Maven installed.

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```
The backend API will start on `http://localhost:8080`.

### 2. Start the React Frontend
Ensure you have Node.js (v18+) installed.

```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will typically start on `http://localhost:5173` or `http://localhost:5174`. Open this URL in your browser.

---

##  How to Use the Sandbox

1. **Mint Initial Funds**: Use the "Create Transaction" panel, click **Use System**, and enter a recipient address and amount to mint new BCOINS without needing a signature.
2. **Mine a Block**: Go to "Network Mining", ensure your miner reward address is set, and click **Start Mining Block** to solve the Proof of Work puzzle and add the mempool transactions to the ledger.
3. **Generate Wallets**: Use the "Wallet Hub" to generate new RSA key pairs for peer-to-peer testing.
4. **Send Peer-to-Peer**: Enter the sender's public key, recipient's public key, and amount. Provide the sender's private key to cryptographically sign the transaction before broadcasting it to the mempool.
5. **Explore the Ledger**: Scroll through the horizontal block list at the bottom to view decoded block hashes, nonces, and transaction histories.

---

##  Security Disclaimer
This project is an **educational sandbox**. The private keys are generated on the backend and transmitted to the frontend for demonstration purposes. In a real-world production blockchain, private keys must **never** leave the client's local environment.
