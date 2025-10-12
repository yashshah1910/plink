# Plink Smart Contracts

Plink is a decentralized savings dApp where parents create time-locked "Stashes" (digital piggy banks) for their children. Family and friends can then gift USDC to these Stashes.

## Files

### Contracts
- `cadence/contracts/Plink.cdc` - Main Plink smart contract

### Transactions
- `cadence/transactions/create_stash.cdc` - Create a new time-locked Stash
- `cadence/transactions/add_funds_to_stash.cdc` - Add funds to an existing Stash
- `cadence/transactions/withdraw_from_stash.cdc` - Withdraw funds after unlock date

### Scripts
- `cadence/scripts/get_stashes.cdc` - Get all Stashes for an account
- `cadence/scripts/get_stash.cdc` - Get a specific Stash by ID

## 1) Start the emulator

```bash
flow emulator --block-time 1s
```

Keep this running. Open a new terminal for the next steps.

## 2) Deploy contracts

```bash
flow project deploy --network emulator
```

This deploys the `Plink` contract (see `flow.json`).

## 3) Create a Stash

Create a time-locked Stash for a child:

```bash
flow transactions send cadence/transactions/create_stash.cdc \
  --arg String:"Alice" \
  --arg UFix64:1735689600.0 \
  --network emulator \
  --signer emulator-account
```

## 4) Get all Stashes

View all Stashes for an account:

```bash
flow scripts execute cadence/scripts/get_stashes.cdc \
  --arg Address:0xf8d6e0586b0a20c7 \
  --network emulator
```

## 5) Get a specific Stash

View a specific Stash by ID:

```bash
flow scripts execute cadence/scripts/get_stash.cdc \
  --arg Address:0xf8d6e0586b0a20c7 \
  --arg UInt64:1 \
  --network emulator
```

## 6) Add funds to a Stash (Demo)

```bash
flow transactions send cadence/transactions/add_funds_to_stash.cdc \
  --arg UInt64:1 \
  --arg UFix64:100.0 \
  --network emulator \
  --signer emulator-account
```

## 7) Withdraw from Stash (after unlock)

```bash
flow transactions send cadence/transactions/withdraw_from_stash.cdc \
  --arg UInt64:1 \
  --arg UFix64:50.0 \
  --network emulator \
  --signer emulator-account
```

## 📦 Project Structure

Your Plink project structure:

- `flow.json` – Project configuration with Plink contract
- `/cadence` – Your Cadence code

Inside the `cadence` folder:

- `/contracts` - Smart contracts
  - `Plink.cdc` - Main Plink contract with Stash and Collection resources

- `/scripts` - Read-only operations
  - `get_stashes.cdc` - Get all Stashes for an account
  - `get_stash.cdc` - Get a specific Stash by ID

- `/transactions` - State-changing operations
  - `create_stash.cdc` - Create a new time-locked Stash
  - `add_funds_to_stash.cdc` - Add funds to existing Stash
  - `withdraw_from_stash.cdc` - Withdraw funds after unlock

- `/tests` - Integration tests (empty for now)

## 🔧 Core Features

- **Time-Locked Stashes**: Digital piggy banks that unlock on specific dates
- **Family-Friendly**: Named Stashes for children with clear ownership
- **Secure Storage**: Proper Flow blockchain storage patterns
- **Event Tracking**: On-chain events for transparency
- **Public Visibility**: Safe public access to Stash information

## 🔨 Additional Resources

- **[Flow Documentation](https://developers.flow.com/)** - Official Flow Documentation
- **[Cadence Documentation](https://cadence-lang.org/docs/language)** - Cadence language reference
- **[Flow CLI Commands](https://developers.flow.com/build/tools/flow-cli/commands)** - All CLI commands
- **[Flowser](https://flowser.dev/)** - Block explorer for local development
