import "Plink"
import "FungibleToken"
import "FlowToken"

transaction(stashId: UInt64, amount: UFix64) {

    prepare(signer: auth(Storage, BorrowValue) &Account) {
        // Get a reference to the signer's collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(
            from: Plink.CollectionStoragePath
        ) ?? panic("Could not borrow reference to collection")

        // Get a reference to the specific Stash
        let stashRef = collectionRef.borrowStash(id: stashId)
            ?? panic("Could not borrow reference to stash")

        // Withdraw REAL FLOW tokens from the Stash
        // This will automatically check if the unlock date has passed
        let withdrawnVault <- stashRef.withdraw(amount: amount) as! @FlowToken.Vault

        // Get reference to the signer's FlowToken vault
        let receiverRef = signer.storage.borrow<&FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FlowToken vault")

        // Deposit the withdrawn tokens into the signer's wallet
        receiverRef.deposit(from: <-withdrawnVault)

        log("✅ Successfully withdrew ".concat(amount.toString()).concat(" FLOW from stash ").concat(stashId.toString()))
    }
}