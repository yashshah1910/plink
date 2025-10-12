import "Plink"

// Define a struct to hold the data for each Stash
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

access(all) fun main(account: Address): [StashData] {
    // Get the public capability for the Plink Collection
    let capability = getAccount(account)
        .capabilities.get<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)

    // Borrow the capability to get a reference to the collection
    let collectionRef = capability.borrow()
        ?? panic("Could not borrow a reference to the Stash Collection")

    // Get all Stash IDs
    let stashIDs = collectionRef.getIDs()

    // Create results array
    let results: [StashData] = []

    // Loop through each ID and get Stash data
    for id in stashIDs {
        if let stashRef = collectionRef.borrowStash(id: id) {
            let stashData = StashData(
                id: stashRef.uuid,
                ownerName: stashRef.ownerName,
                unlockDate: stashRef.unlockDate,
                balance: stashRef.getBalance()
            )
            results.append(stashData)
        }
    }

    return results
}