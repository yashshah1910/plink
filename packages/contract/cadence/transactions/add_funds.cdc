// add_funds.cdc
// This transaction allows a signer to deposit REAL FLOW tokens into a specific Stash with an optional message.

import "Plink"
import "FungibleToken"
import "FlowToken"

transaction(recipientAddress: Address, stashID: UInt64, amount: UFix64, message: String) {
    
    let sentVault: @FlowToken.Vault
    let senderAddress: Address
    
    prepare(signer: auth(Storage, BorrowValue) &Account) {
        // Store sender address for history
        self.senderAddress = signer.address
        
        // Borrow the sender's FlowToken vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FlowToken vault from signer storage")
        
        // Withdraw REAL FLOW tokens from the sender
        self.sentVault <- vaultRef.withdraw(amount: amount) as! @FlowToken.Vault
        
        log("✅ Withdrew ".concat(amount.toString()).concat(" FLOW from sender's wallet"))
    }
    
    execute {
        // Get a reference to the recipient's public Collection capability
        let capability = getAccount(recipientAddress)
            .capabilities.get<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
        
        let collectionRef = capability.borrow()
            ?? panic("Could not borrow a reference to the recipient's Collection")

        // Borrow a reference to the specific Stash within the collection
        let stashRef = collectionRef.borrowStash(id: stashID)
            ?? panic("Could not borrow a reference to the Stash in the Collection")
        
        // Deposit REAL FLOW tokens into the Stash with sender info and message
        stashRef.deposit(from: <-self.sentVault, sender: self.senderAddress, message: message)

        log("✅ Successfully deposited REAL FLOW tokens to Stash #".concat(stashID.toString()))
    }
}