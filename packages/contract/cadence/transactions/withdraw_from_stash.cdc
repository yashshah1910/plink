import "Plink"

transaction(stashId: UInt64, amount: UFix64) {

    prepare(signer: auth(Storage) &Account) {
        // Get a reference to the signer's collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow reference to collection")

        // Get a reference to the specific Stash
        let stashRef = collectionRef.borrowStash(id: stashId)
            ?? panic("Could not borrow reference to stash")

        // Attempt to withdraw funds from the Stash
        // This will automatically check if the unlock date has passed
        let withdrawnAmount = stashRef.withdraw(amount: amount)

        log("Successfully withdrew ".concat(withdrawnAmount.toString()).concat(" from stash ").concat(stashId.toString()))
    }
}