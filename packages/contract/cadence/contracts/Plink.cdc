import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import FlowTransactionScheduler from "FlowTransactionScheduler"
import ViewResolver from "ViewResolver"

access(all) contract Plink {
    
    // Storage and Public paths for the Collection
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    
    // Storage path for UnlockHandler
    access(all) let UnlockHandlerStoragePath: StoragePath
    access(all) let UnlockHandlerPrivatePath: PrivatePath

    // Events
    access(all) event StashCreated(id: UInt64, ownerName: String, unlockDate: UFix64)
    access(all) event StashDeposit(id: UInt64, amount: UFix64, from: Address?, message: String)
    access(all) event StashWithdraw(id: UInt64, amount: UFix64, to: Address)
    access(all) event StashUnlockScheduled(id: UInt64, scheduledTransactionID: UInt64, unlockDate: UFix64)
    access(all) event StashAutoUnlocked(id: UInt64, scheduledTransactionID: UInt64)

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
        access(all) var isUnlocked: Bool
        access(all) var scheduledUnlockTransactionID: UInt64?

        init(ownerName: String, unlockDate: UFix64) {
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.depositHistory = []
            self.isUnlocked = false
            self.scheduledUnlockTransactionID = nil
            
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

        // Function to withdraw REAL FLOW tokens (only after unlock date or if auto-unlocked)
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
                self.isUnlocked || getCurrentBlock().timestamp >= self.unlockDate: "Stash is still locked"
                self.vault.balance >= amount: "Insufficient balance in stash"
            }
            
            // Withdraw REAL FlowToken from the vault
            let withdrawnTokens <- self.vault.withdraw(amount: amount)
            
            emit StashWithdraw(id: self.uuid, amount: amount, to: self.owner?.address ?? panic("No owner"))
            
            return <-withdrawnTokens
        }
        
        // Function to mark stash as unlocked (called by scheduled transaction)
        access(contract) fun markAsUnlocked() {
            self.isUnlocked = true
        }
        
        // Function to set scheduled transaction ID
        access(contract) fun setScheduledUnlockTransactionID(id: UInt64) {
            self.scheduledUnlockTransactionID = id
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
        
        // Function to borrow a mutable reference to a Stash (contract only)
        access(contract) fun borrowStashAuth(id: UInt64): auth(Mutate) &Stash? {
            return &self.stashes[id]
        }
    }
    
    // UnlockHandler implements the TransactionHandler interface for scheduled unlocks
    access(all) resource UnlockHandler: FlowTransactionScheduler.TransactionHandler, ViewResolver.Resolver {
        // Capability to access the owner's collection
        access(self) let collectionCap: Capability<auth(Mutate) &Collection>
        
        init(collectionCap: Capability<auth(Mutate) &Collection>) {
            self.collectionCap = collectionCap
        }
        
        // Execute the scheduled unlock transaction
        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            // Data should contain the stash ID
            let stashID = data as? UInt64 ?? panic("Invalid data: Expected stash ID")
            
            // Get reference to the collection using the capability
            let collectionRef = self.collectionCap.borrow()
                ?? panic("Could not borrow collection reference")
            
            // Get reference to the stash
            let stashRef = collectionRef.borrowStashAuth(id: stashID)
                ?? panic("Could not borrow stash reference")
            
            // Mark the stash as unlocked
            stashRef.markAsUnlocked()
            
            emit StashAutoUnlocked(id: stashID, scheduledTransactionID: id)
        }
        
        // ViewResolver implementation
        access(all) view fun getViews(): [Type] {
            return []
        }
        
        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return nil
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
    
    // Function to create an UnlockHandler
    access(all) fun createUnlockHandler(collectionCap: Capability<auth(Mutate) &Collection>): @UnlockHandler {
        return <-create UnlockHandler(collectionCap: collectionCap)
    }
    
    // Function to schedule an unlock for a stash (must be called by the owner)
    access(all) fun scheduleUnlock(
        collectionRef: auth(Mutate) &Collection, 
        stashID: UInt64,
        scheduledTransactionID: UInt64
    ) {
        let stashRef = collectionRef.borrowStashAuth(id: stashID)
            ?? panic("Could not borrow stash reference")
        
        stashRef.setScheduledUnlockTransactionID(id: scheduledTransactionID)
        
        emit StashUnlockScheduled(id: stashID, scheduledTransactionID: scheduledTransactionID, unlockDate: stashRef.unlockDate)
    }

    init() {
        // Set the storage and public paths
        self.CollectionStoragePath = /storage/PlinkStashCollection
        self.CollectionPublicPath = /public/PlinkStashCollection
        self.UnlockHandlerStoragePath = /storage/PlinkUnlockHandler
        self.UnlockHandlerPrivatePath = /private/PlinkUnlockHandler
    }
}