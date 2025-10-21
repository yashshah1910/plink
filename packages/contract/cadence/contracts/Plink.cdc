import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

access(all) contract Plink {
    
    // Storage and Public paths for the Collection
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath

    // Events
    access(all) event StashCreated(id: UInt64, ownerName: String, unlockDate: UFix64)
    access(all) event StashDeposit(id: UInt64, amount: UFix64, from: Address?, message: String)
    access(all) event StashWithdraw(id: UInt64, amount: UFix64, to: Address)

    // Struct to track deposit/gift history
    access(all) struct DepositRecord {
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64
        access(all) let from: Address?
        access(all) let message: String
        
        init(amount: UFix64, from: Address?, message: String) {
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
            self.from = from
            self.message = message
        }
    }

    // Stash resource representing a time-locked savings vault with REAL FlowToken
    access(all) resource Stash {
        access(all) let ownerName: String
        access(all) let unlockDate: UFix64
        access(all) let vault: @FlowToken.Vault
        access(all) var depositHistory: [DepositRecord]

        init(ownerName: String, unlockDate: UFix64) {
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.depositHistory = []
            
            // Create empty FlowToken vault to store REAL FLOW
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
            
            emit StashCreated(id: self.uuid, ownerName: ownerName, unlockDate: unlockDate)
        }

        // Function to deposit REAL FLOW tokens into the stash
        access(all) fun deposit(from: @{FungibleToken.Vault}, sender: Address?, message: String) {
            let amount = from.balance
            
            // Deposit REAL FlowToken into the vault
            self.vault.deposit(from: <-from)
            
            // Record the deposit in history
            let record = DepositRecord(amount: amount, from: sender, message: message)
            self.depositHistory.append(record)
            
            emit StashDeposit(id: self.uuid, amount: amount, from: sender, message: message)
        }

        // Function to withdraw REAL FLOW tokens (only after unlock date)
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
                getCurrentBlock().timestamp >= self.unlockDate: "Stash is still locked"
                self.vault.balance >= amount: "Insufficient balance in stash"
            }
            
            // Withdraw REAL FlowToken from the vault
            let withdrawnTokens <- self.vault.withdraw(amount: amount)
            
            emit StashWithdraw(id: self.uuid, amount: amount, to: self.owner?.address ?? panic("No owner"))
            
            return <-withdrawnTokens
        }

        // Function to get the current balance
        access(all) view fun getBalance(): UFix64 {
            return self.vault.balance
        }
        
        // Function to get deposit history
        access(all) view fun getDepositHistory(): [DepositRecord] {
            return self.depositHistory
        }
    }

    // Public interface for the Collection
    access(all) resource interface CollectionPublic {
        access(all) view fun getIDs(): [UInt64]
        access(all) view fun borrowStash(id: UInt64): &Stash?
    }

    // Collection resource to hold multiple Stashes
    access(all) resource Collection: CollectionPublic {
        access(all) var stashes: @{UInt64: Stash}

        init() {
            self.stashes <- {}
        }

        // Function to deposit a new Stash into the collection
        access(all) fun deposit(stash: @Stash) {
            let id = stash.uuid
            let oldStash <- self.stashes[id] <- stash
            destroy oldStash
        }

        // Function to get all Stash IDs
        access(all) view fun getIDs(): [UInt64] {
            return self.stashes.keys
        }

        // Function to safely borrow a reference to a Stash
        access(all) view fun borrowStash(id: UInt64): &Stash? {
            return &self.stashes[id]
        }
    }

    // Function to create an empty Collection
    access(all) fun createEmptyCollection(): @Collection {
        return <-create Collection()
    }

    // Function to create a new Stash
    access(all) fun createStash(ownerName: String, unlockDate: UFix64): @Stash {
        return <-create Stash(ownerName: ownerName, unlockDate: unlockDate)
    }

    init() {
        // Set the storage and public paths
        self.CollectionStoragePath = /storage/PlinkStashCollection
        self.CollectionPublicPath = /public/PlinkStashCollection
    }
}