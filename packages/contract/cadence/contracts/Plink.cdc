access(all) contract Plink {
    
    // Storage and Public paths for the Collection
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath

    // Events
    access(all) event StashCreated(id: UInt64, ownerName: String, unlockDate: UFix64)
    access(all) event StashDeposit(id: UInt64, amount: UFix64)
    access(all) event StashWithdraw(id: UInt64, amount: UFix64)

    // Vault interface for future FungibleToken compatibility
    access(all) resource interface VaultInterface {
        access(all) var balance: UFix64
        access(all) fun deposit(amount: UFix64)
        access(all) fun withdraw(amount: UFix64): UFix64
        access(all) view fun getBalance(): UFix64
    }

    // Vault resource that mimics FungibleToken.Vault behavior
    access(all) resource Vault: VaultInterface {
        access(all) var balance: UFix64

        init() {
            self.balance = 0.0
        }

        access(all) fun deposit(amount: UFix64) {
            self.balance = self.balance + amount
        }

        access(all) fun withdraw(amount: UFix64): UFix64 {
            pre {
                self.balance >= amount: "Insufficient balance"
            }
            self.balance = self.balance - amount
            return amount
        }

        access(all) view fun getBalance(): UFix64 {
            return self.balance
        }
    }

    // Stash resource representing a time-locked savings vault
    access(all) resource Stash {
        access(all) let ownerName: String
        access(all) let unlockDate: UFix64
        access(all) let vault: @Vault

        init(ownerName: String, unlockDate: UFix64) {
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.vault <- create Vault()
            
            emit StashCreated(id: self.uuid, ownerName: ownerName, unlockDate: unlockDate)
        }

        // Function to deposit funds into the stash
        access(all) fun deposit(amount: UFix64) {
            self.vault.deposit(amount: amount)
            emit StashDeposit(id: self.uuid, amount: amount)
        }

        // Function to withdraw funds (only after unlock date)
        access(all) fun withdraw(amount: UFix64): UFix64 {
            pre {
                getCurrentBlock().timestamp >= self.unlockDate: "Stash is still locked"
                self.vault.balance >= amount: "Insufficient balance in stash"
            }
            
            let withdrawnAmount = self.vault.withdraw(amount: amount)
            emit StashWithdraw(id: self.uuid, amount: withdrawnAmount)
            return withdrawnAmount
        }

        // Function to get the current balance
        access(all) view fun getBalance(): UFix64 {
            return self.vault.getBalance()
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