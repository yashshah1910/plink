import "Plink"

transaction(ownerName: String, unlockDate: UFix64) {

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if a Plink Collection already exists at the storage path
        if signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath) == nil {
            // Create a new empty collection
            let collection <- Plink.createEmptyCollection()
            
            // Save the collection to storage
            signer.storage.save(<-collection, to: Plink.CollectionStoragePath)
            
            // Create and publish a public capability
            let capability = signer.capabilities.storage.issue<&{Plink.CollectionPublic}>(Plink.CollectionStoragePath)
            signer.capabilities.publish(capability, at: Plink.CollectionPublicPath)
        }

        // Create a new Stash
        let newStash <- Plink.createStash(ownerName: ownerName, unlockDate: unlockDate)

        // Borrow a reference to the user's collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow reference to collection")

        // Deposit the new Stash into the collection
        collectionRef.deposit(stash: <-newStash)

        log("Stash created for ".concat(ownerName))
    }
}