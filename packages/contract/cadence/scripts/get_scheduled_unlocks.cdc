import "Plink"
import "FlowTransactionScheduler"

/// This script returns information about scheduled unlock transactions for stashes
/// owned by a specific address
access(all) struct StashUnlockInfo {
    access(all) let stashID: UInt64
    access(all) let ownerName: String
    access(all) let unlockDate: UFix64
    access(all) let balance: UFix64
    access(all) let isUnlocked: Bool
    access(all) let scheduledTransactionID: UInt64?
    access(all) let scheduledTransactionStatus: FlowTransactionScheduler.Status?
    
    init(
        stashID: UInt64,
        ownerName: String,
        unlockDate: UFix64,
        balance: UFix64,
        isUnlocked: Bool,
        scheduledTransactionID: UInt64?,
        scheduledTransactionStatus: FlowTransactionScheduler.Status?
    ) {
        self.stashID = stashID
        self.ownerName = ownerName
        self.unlockDate = unlockDate
        self.balance = balance
        self.isUnlocked = isUnlocked
        self.scheduledTransactionID = scheduledTransactionID
        self.scheduledTransactionStatus = scheduledTransactionStatus
    }
}

access(all) fun main(address: Address): [StashUnlockInfo] {
    let account = getAccount(address)
    
    // Try to borrow the collection
    let collectionRef = account.capabilities.borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
        ?? panic("Could not borrow collection reference for address: ".concat(address.toString()))
    
    let stashIDs = collectionRef.getIDs()
    let result: [StashUnlockInfo] = []
    
    for stashID in stashIDs {
        let stashRef = collectionRef.borrowStash(id: stashID)
        if stashRef != nil {
            let scheduledTxID = stashRef!.scheduledUnlockTransactionID
            var status: FlowTransactionScheduler.Status? = nil
            
            if scheduledTxID != nil {
                status = FlowTransactionScheduler.getStatus(id: scheduledTxID!)
            }
            
            let info = StashUnlockInfo(
                stashID: stashID,
                ownerName: stashRef!.ownerName,
                unlockDate: stashRef!.unlockDate,
                balance: stashRef!.getBalance(),
                isUnlocked: stashRef!.isUnlocked,
                scheduledTransactionID: scheduledTxID,
                scheduledTransactionStatus: status
            )
            result.append(info)
        }
    }
    
    return result
}
