// add_funds.cdc
// This transaction allows a signer to deposit funds into a specific Stash.

import "Plink"

transaction(recipientAddress: Address, stashID: UInt64, amount: UFix64) {

    prepare(signer: auth(Storage) &Account) {
        
        // Get a reference to the recipient's public Collection capability
        let capability = getAccount(recipientAddress)
            .capabilities.get<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
        
        let collectionRef = capability.borrow()
            ?? panic("Could not borrow a reference to the recipient's Collection")

        // Borrow a reference to the specific Stash within the collection
        let stashRef = collectionRef.borrowStash(id: stashID)
            ?? panic("Could not borrow a reference to the Stash in the Collection")
        
        // Call the deposit function on the Stash
        // This now properly deposits into the Vault resource
        stashRef.deposit(amount: amount)

        log("✅ Successfully deposited ".concat(amount.toString()).concat(" to Stash #").concat(stashID.toString()))
    }
}