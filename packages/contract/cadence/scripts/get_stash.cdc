import "Plink"

// Define the StashData struct for this script
access(all) struct StashData {
    access(all) let id: UInt64
    access(all) let ownerName: String
    access(all) let unlockDate: UFix64
    access(all) let balance: UFix64

    init(id: UInt64, ownerName: String, unlockDate: UFix64, balance: UFix64) {
        self.id = id
        self.ownerName = ownerName
        self.unlockDate = unlockDate
        self.balance = balance
    }
}

access(all) fun main(account: Address, stashId: UInt64): StashData? {
    // Get the public capability for the Plink Collection
    let capability = getAccount(account)
        .capabilities.get<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)

    // Borrow the capability to get a reference to the collection
    let collectionRef = capability.borrow()
    if collectionRef == nil {
        return nil
    }

    // Get the specific Stash
    if let stashRef = collectionRef!.borrowStash(id: stashId) {
        return StashData(
            id: stashRef.uuid,
            ownerName: stashRef.ownerName,
            unlockDate: stashRef.unlockDate,
            balance: stashRef.getBalance()
        )
    }

    return nil
}