import "Plink"

transaction(ownerName: String, unlockDate: UFix64) {

    prepare(signer: auth(Storage, Capabilities) &Account) {
        
        // Step 1: Set up the Collection if it doesn't exist
        if signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath) == nil {
            // Create a new empty collection and save it to the account's storage
            signer.storage.save(<-Plink.createEmptyCollection(), to: Plink.CollectionStoragePath)
            
            // Create and publish a public capability
            let capability = signer.capabilities.storage.issue<&{Plink.CollectionPublic}>(Plink.CollectionStoragePath)
            signer.capabilities.publish(capability, at: Plink.CollectionPublicPath)
        }
        
        // Step 2: Create the new Stash
        let newStash <- Plink.createStash(ownerName: ownerName, unlockDate: unlockDate)
        
        // Step 3: Deposit the Stash into the user's Collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the Stash Collection")
        
        collectionRef.deposit(stash: <-newStash)

        log("✅ Stash created successfully for ".concat(ownerName))
    }
}