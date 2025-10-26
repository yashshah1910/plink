# Plink ✨

*Save for the future, one plink at a time.*

Plink is a decentralized gifting and savings platform built on the **Flow Blockchain**. It allows parents to create secure, time-locked digital piggy banks ("Stashes") for their children. Family and friends can easily contribute $FLOW tokens via a simple, shareable link, with each gift being recorded alongside a personal message - creating a permanent, digital memory book for the child's future.

---

## 🌐 Deployment Status

**Plink is currently deployed and running on Flow Testnet.**

- **Network:** Flow Testnet
- **Plink Contract Address:** `0x99aa32ecca179759`
- **View Contract on Flow Explorer:** [https://testnet.flowscan.io/account/0x99aa32ecca179759](https://testnet.flowscan.io/account/0x99aa32ecca179759)

The application uses $FLOW tokens for all transactions. USDC support is planned for future releases.

---

## The Vision

The goal of Plink is to make crypto gifting and long-term saving for loved ones easy, meaningful, and secure. We solve the "Grandma Problem" by abstracting away the complexities of blockchain and providing a simple, joyful user experience. By leveraging the Flow blockchain's speed and security, Plink turns financial gifts into a treasured digital inheritance.

## Key Features

* **Create Time-Locked "Stashes"**: Parents can create secure savings vaults that are locked until a specific date, like a child's 18th birthday.
* **Simple, Sharable Gift Links**: No more copying long wallet addresses. Every Stash has a unique, friendly link for easy gifting.
* **Recurring Gifts**: Givers can set up one-time, monthly, or annual gifts, creating a stable and predictable savings stream.
* **The Digital Memory Book**: Every gift is stored on-chain with a personal message from the giver, creating a permanent record of generosity.
* **$FLOW Tokens**: All Stashes currently use $FLOW, the native token of the Flow blockchain. *(USDC support coming soon!)*

---

## 🚀 Getting Started (Local Development)

Follow these steps to run Plink locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **pnpm** (recommended package manager)
- **Flow CLI** ([Installation Guide](https://developers.flow.com/tools/flow-cli/install))

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yashshah1910/plink.git
   cd plink
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up and run the Flow Emulator:**

   Open a new terminal (Terminal 1) and navigate to the contract directory:

   ```bash
   cd packages/contract
   flow emulator
   ```

   Keep this terminal running.

4. **Deploy contracts to the emulator:**

   Open another terminal (Terminal 2), navigate to the contract directory, and deploy:

   ```bash
   cd packages/contract
   flow project deploy --network emulator
   ```

5. **Start the Flow Dev Wallet:**

   Open another terminal (Terminal 3) and start the development wallet:

   ```bash
   cd packages/contract
   flow dev-wallet
   ```

   Keep this terminal running. The dev wallet will be available at `http://localhost:8701`.

6. **Get Testnet FLOW (if testing on Testnet)**

   If you're testing against Flow Testnet (instead of the local emulator), you'll need testnet $FLOW to send transactions. Request testnet tokens from the official Flow faucet:

   - Faucet: https://faucet.flow.com/fund-account

   Paste your Testnet account address into the faucet form to receive testnet funds. If you are using the local emulator & dev-wallet, accounts are typically pre-funded by the emulator.

7. **Run the web application:**

   Open a final terminal (Terminal 4), navigate to the web directory, and start the development server:

   ```bash
   cd packages/web
   pnpm dev
   ```

8. **Access the application:**

   Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

   You should now see the Plink application running locally with the Flow emulator and dev wallet!

---

## 📁 Project Structure

```
plink/
├── packages/
│   ├── contract/          # Flow smart contracts (Cadence)
│   │   ├── cadence/
│   │   │   ├── contracts/ # Plink.cdc and dependencies
│   │   │   ├── scripts/   # Read-only blockchain queries
│   │   │   └── transactions/ # State-changing operations
│   │   └── flow.json      # Flow configuration
│   └── web/               # Next.js frontend application
│       ├── src/
│       │   ├── app/       # Next.js app directory
│       │   ├── components/ # React components
│       │   ├── context/   # React context (user auth)
│       │   └── flow/      # FCL configuration
│       └── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- **Blockchain:** Flow Blockchain (Testnet)
- **Smart Contracts:** Cadence
- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS
- **Flow Integration:** Flow Client Library (FCL)
- **Package Manager:** pnpm

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🔗 Links

- [Flow Blockchain](https://flow.com/)
- [Flow Documentation](https://developers.flow.com/)
- [Cadence Documentation](https://cadence-lang.org/)
- [Flow Testnet Explorer](https://testnet.flowscan.io/)
- [Flow Testnet Faucet](https://faucet.flow.com/fund-account/)

---

**Built with ❤️ on Flow Blockchain**
