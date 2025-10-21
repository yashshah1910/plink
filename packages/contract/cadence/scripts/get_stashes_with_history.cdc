import "Plink"

access(all) struct StashWithHistory {
    access(all) let id: UInt64
    access(all) let ownerName: String
    access(all) let unlockDate: UFix64
    access(all) let balance: UFix64
    access(all) let isLocked: Bool
    access(all) let depositHistory: [Plink.DepositRecord]

    init(
        id: UInt64, 
        ownerName: String, 
        unlockDate: UFix64, 
        balance: UFix64, 
        isLocked: Bool,
        depositHistory: [Plink.DepositRecord]
    ) {
        self.id = id
        self.ownerName = ownerName
        self.unlockDate = unlockDate
        self.balance = balance
        self.isLocked = isLocked
        self.depositHistory = depositHistory
    }
}

access(all) fun main(address: Address): [StashWithHistory] {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
    
    if collectionRef == nil {
        return []
    }
    
    let ids = collectionRef!.getIDs()
    let stashInfos: [StashWithHistory] = []
    
    for id in ids {
        if let stashRef = collectionRef!.borrowStash(id: id) {
            let currentTime = getCurrentBlock().timestamp
            let isLocked = currentTime < stashRef.unlockDate
            
            stashInfos.append(StashWithHistory(
                id: id,
                ownerName: stashRef.ownerName,
                unlockDate: stashRef.unlockDate,
                balance: stashRef.getBalance(),
                isLocked: isLocked,
                depositHistory: stashRef.getDepositHistory()
            ))
        }
    }
    
    return stashInfos
}
