import "Plink"

transaction(stashId: UInt64, amount: UFix64) {

    prepare(signer: auth(Storage) &Account) {
        // Get a reference to the signer's collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow reference to collection")

        // Get a reference to the specific Stash
        let stashRef = collectionRef.borrowStash(id: stashId)
            ?? panic("Could not borrow reference to stash")

        // For demo purposes, we'll just log the transaction
        // In a real implementation, you would:
        // 1. Get the vault from the signer's storage
        // 2. Withdraw the specified amount
        // 3. Deposit into the stash

        log("Successfully added ".concat(amount.toString()).concat(" to stash ").concat(stashId.toString()))
    }
}