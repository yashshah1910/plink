import "Plink"
import "FlowTransactionScheduler"
import "FlowToken"
import "FungibleToken"

/// This transaction schedules an automatic unlock for a stash at its unlock date
/// It sets up the UnlockHandler if needed and schedules the transaction with FlowTransactionScheduler
transaction(stashID: UInt64) {

    prepare(signer: auth(Storage, Capabilities, IssueStorageCapabilityController, PublishCapability, SaveValue, BorrowValue) &Account) {
        
        // Step 1: Ensure the UnlockHandler exists
        if signer.storage.borrow<&Plink.UnlockHandler>(from: Plink.UnlockHandlerStoragePath) == nil {
            // Create a capability to the collection with Mutate entitlement
            let collectionCap = signer.capabilities.storage.issue<auth(Mutate) &Plink.Collection>(
                Plink.CollectionStoragePath
            )
            
            // Create and save the UnlockHandler
            let handler <- Plink.createUnlockHandler(collectionCap: collectionCap)
            signer.storage.save(<-handler, to: Plink.UnlockHandlerStoragePath)
        }
        
        // Step 2: Get the stash to determine unlock date
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow Collection reference")
        
        let stashRef = collectionRef.borrowStash(id: stashID)
            ?? panic("Could not borrow Stash reference for ID: ".concat(stashID.toString()))
        
        let unlockDate = stashRef.unlockDate
        
        // Check if unlock date is in the future
        if getCurrentBlock().timestamp >= unlockDate {
            panic("Stash unlock date has already passed")
        }
        
        // Step 3: Issue a capability to the UnlockHandler
        let handlerCap = signer.capabilities.storage.issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(
            Plink.UnlockHandlerStoragePath
        )
        
        // Step 4: Estimate fees for scheduling
        let estimate = FlowTransactionScheduler.estimate(
            data: stashID,
            timestamp: unlockDate,
            priority: FlowTransactionScheduler.Priority.Medium,
            executionEffort: 100 // Estimated effort for unlock operation
        )
        
        if estimate.error != nil {
            panic("Could not estimate scheduling: ".concat(estimate.error!))
        }
        
        let requiredFee = estimate.flowFee ?? panic("Could not determine fee")
        
        // Step 5: Withdraw fees from the signer's FlowToken vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FlowToken vault")
        
        let fees <- vaultRef.withdraw(amount: requiredFee) as! @FlowToken.Vault
        
        // Step 6: Schedule the unlock transaction
        let scheduledTransaction <- FlowTransactionScheduler.schedule(
            handlerCap: handlerCap,
            data: stashID, // Pass stash ID as data
            timestamp: unlockDate,
            priority: FlowTransactionScheduler.Priority.Medium,
            executionEffort: 100,
            fees: <-fees
        )
        
        let scheduledID = scheduledTransaction.id
        
        // Step 7: Store the scheduled transaction ID in the stash using the new contract function
        let collectionAuthRef = signer.storage.borrow<auth(Mutate) &Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow authorized Collection reference")
        
        Plink.scheduleUnlock(collectionRef: collectionAuthRef, stashID: stashID, scheduledTransactionID: scheduledID)
        
        // Destroy the receipt (we've stored the ID)
        destroy scheduledTransaction
        
        log("✅ Scheduled automatic unlock for stash ID ".concat(stashID.toString())
            .concat(" at timestamp ").concat(unlockDate.toString())
            .concat(". Scheduled transaction ID: ").concat(scheduledID.toString()))
    }
}
