import "Plink"
import "FlowTransactionScheduler"
import "FlowToken"
import "FungibleToken"

transaction(ownerName: String, unlockDate: UFix64) {

    prepare(signer: auth(Storage, Capabilities, IssueStorageCapabilityController, PublishCapability, SaveValue, BorrowValue) &Account) {
        
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
        let stashID = newStash.uuid
        
        // Step 3: Deposit the Stash into the user's Collection
        let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the Stash Collection")
        
        collectionRef.deposit(stash: <-newStash)

        log("✅ Stash created successfully for ".concat(ownerName))
        
        // Step 4: Schedule automatic unlock by default
        // Check if unlock date is in the future
        if getCurrentBlock().timestamp >= unlockDate {
            log("⚠️ Unlock date is not in the future, skipping auto-unlock scheduling")
        } else {
            // Set up UnlockHandler if needed
            if signer.storage.borrow<&Plink.UnlockHandler>(from: Plink.UnlockHandlerStoragePath) == nil {
                let collectionCap = signer.capabilities.storage.issue<auth(Mutate) &Plink.Collection>(
                    Plink.CollectionStoragePath
                )
                let handler <- Plink.createUnlockHandler(collectionCap: collectionCap)
                signer.storage.save(<-handler, to: Plink.UnlockHandlerStoragePath)
            }

            // Issue capability to the UnlockHandler
            let handlerCap = signer.capabilities.storage.issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(
                Plink.UnlockHandlerStoragePath
            )

            // Estimate fees
            let estimate = FlowTransactionScheduler.estimate(
                timestamp: unlockDate,
                priority: FlowTransactionScheduler.Priority.Medium,
                executionEffort: 100
            )

            if estimate.error != nil {
                log("⚠️ Could not estimate scheduling: ".concat(estimate.error!))
            } else {
                let requiredFee = estimate.flowFee ?? 0.0

                // Withdraw fees
                let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                    from: /storage/flowTokenVault
                ) ?? panic("Could not borrow FlowToken vault")

                let fees <- vaultRef.withdraw(amount: requiredFee) as! @FlowToken.Vault

                // Schedule the unlock
                let scheduledTransaction <- FlowTransactionScheduler.schedule(
                    handlerCap: handlerCap,
                    data: stashID,
                    timestamp: unlockDate,
                    priority: FlowTransactionScheduler.Priority.Medium,
                    executionEffort: 100,
                    fees: <-fees
                )

                let scheduledID = scheduledTransaction.id

                // Store the scheduled transaction ID
                let stashAuthRef = collectionRef.borrowStashAuth(id: stashID)
                    ?? panic("Could not borrow authorized Stash reference")

                stashAuthRef.setScheduledUnlockTransactionID(id: scheduledID)

                destroy scheduledTransaction

                log("✅ Scheduled automatic unlock at timestamp ".concat(unlockDate.toString())
                    .concat(". Scheduled transaction ID: ").concat(scheduledID.toString()))
            }
        }
    }
}