access(all) contract Plink {

    // Storage and Public paths for the Collection
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath

    // Events
    access(all) event StashCreated(id: UInt64, ownerName: String, unlockDate: UFix64)
    access(all) event StashDeposited(id: UInt64, amount: UFix64)

    // Public interface for the Collection
    access(all) resource interface CollectionPublic {
        access(all) view fun getIDs(): [UInt64]
        access(all) view fun borrowStash(id: UInt64): &Stash?
    }

    // Stash resource representing a time-locked savings vault
    access(all) resource Stash {
        access(all) let ownerName: String
        access(all) let unlockDate: UFix64
        access(all) var balance: UFix64

        init(ownerName: String, unlockDate: UFix64) {
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.balance = 0.0
            
            emit StashCreated(id: self.uuid, ownerName: ownerName, unlockDate: unlockDate)
        }

        // Function to deposit funds into the stash
        access(all) fun deposit(amount: UFix64) {
            self.balance = self.balance + amount
            emit StashDeposited(id: self.uuid, amount: amount)
        }

        // Function to withdraw funds (only after unlock date)
        access(all) fun withdraw(amount: UFix64): UFix64 {
            pre {
                getCurrentBlock().timestamp >= self.unlockDate: "Stash is still locked"
                self.balance >= amount: "Insufficient balance in stash"
            }
            self.balance = self.balance - amount
            return amount
        }

        // Function to get the current balance
        access(all) view fun getBalance(): UFix64 {
            return self.balance
        }
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

        // Function to withdraw a Stash from the collection
        access(all) fun withdraw(id: UInt64): @Stash {
            let stash <- self.stashes.remove(key: id) 
                ?? panic("Stash not found")
            return <-stash
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