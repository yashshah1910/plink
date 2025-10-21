"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import * as fcl from "@onflow/fcl";

interface StashData {
  id: number;
  ownerName: string;
  unlockDate: number;
  balance: number;
}

export default function PublicGiftingPage() {
  const params = useParams();
  const { isLoggedIn, logIn } = useUser();
  
  const recipientAddress = params.address as string;
  const stashId = params.id as string;

  const [stashData, setStashData] = useState<StashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const loadStashData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const getStashScript = `
        import Plink from 0x360397b746e4c184

        access(all) struct StashInfo {
          access(all) let id: UInt64
          access(all) let ownerName: String
          access(all) let unlockDate: UFix64
          access(all) let balance: UFix64

          init(id: UInt64, ownerName: String, unlockDate: UFix64, balance: UFix64) {
            self.id = id
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.balance = balance
          }
        }

        access(all) fun main(address: Address, stashID: UInt64): StashInfo? {
          let account = getAccount(address)
          
          let collectionRef = account.capabilities
            .borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
          
          if collectionRef == nil {
            return nil
          }

          let stashRef = collectionRef!.borrowStash(id: stashID)
          if stashRef == nil {
            return nil
          }

          return StashInfo(
            id: stashRef!.uuid,
            ownerName: stashRef!.ownerName,
            unlockDate: stashRef!.unlockDate,
            balance: stashRef!.getBalance()
          )
        }
      `;

      const result = await fcl.query({
        cadence: getStashScript,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [
          arg(recipientAddress, t.Address),
          arg(stashId, t.UInt64)
        ]
      });

      if (result) {
        setStashData({
          id: parseInt(result.id),
          ownerName: result.ownerName,
          unlockDate: parseFloat(result.unlockDate),
          balance: parseFloat(result.balance)
        });
      } else {
        setError("Stash not found. Please check the link and try again.");
      }
    } catch (err: unknown) {
      console.error("Error loading stash:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load stash information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [recipientAddress, stashId]);

  useEffect(() => {
    loadStashData();
  }, [loadStashData]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, prompt wallet connection first
    if (!isLoggedIn) {
      await logIn();
      return;
    }

    // Validate amount
    const giftAmount = parseFloat(amount);
    if (!giftAmount || giftAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const addFundsTransaction = `
        import Plink from 0x360397b746e4c184
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868

        transaction(recipientAddress: Address, stashID: UInt64, amount: UFix64, message: String) {
          prepare(signer: auth(Storage, BorrowValue) &Account) {
            // Get recipient's collection
            let collectionRef = getAccount(recipientAddress)
              .capabilities.borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
              ?? panic("Could not borrow recipient's Collection")

            let stashRef = collectionRef.borrowStash(id: stashID)
              ?? panic("Could not borrow Stash in Collection")
            
            // Withdraw FLOW from signer's vault
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
              from: /storage/flowTokenVault
            ) ?? panic("Could not borrow FlowToken vault")

            let sentVault <- vaultRef.withdraw(amount: amount) as! @FlowToken.Vault
            
            // Deposit into stash with sender address and message
            stashRef.deposit(from: <-sentVault, sender: signer.address, message: message)

            log("✅ Successfully deposited funds as gift with message.")
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: addFundsTransaction,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [
          arg(recipientAddress, t.Address),
          arg(stashId, t.UInt64),
          arg(giftAmount.toFixed(2), t.UFix64),
          arg(message || "No message", t.String)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      setTransactionId(txId);

      // Wait for transaction to be sealed
      const result = await fcl.tx(txId).onceSealed();
      
      if (result.status === 4) {
        setSuccess(true);
        // Reload stash data to show updated balance
        setTimeout(() => {
          loadStashData();
        }, 1000);
      } else {
        throw new Error("Transaction failed");
      }

    } catch (err: unknown) {
      console.error("Error sending gift:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to send gift. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      {/* Header */}
      <Header />
      
      <div className="relative">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/60 rounded-full animate-spin animation-delay-150"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && !success && (
            <div className="max-w-md mx-auto animate-fade-in-up">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <Button onClick={loadStashData} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success State - The "Plink" Moment! */}
          {success && stashData && (
            <div className="max-w-md mx-auto animate-fade-in-up">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-8 text-center">
                {/* Animated Success Icon */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-scale-in">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Sparkle effects */}
                  <div className="absolute -top-2 -right-2 text-primary animate-float">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 -left-2 text-accent animate-float animation-delay-150">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-3">
                  🎉 Gift Sent!
                </h2>
                <p className="text-lg text-secondary mb-6">
                  Your gift of <span className="font-bold text-primary">${amount} FLOW</span> has been added to {stashData.ownerName}&apos;s Stash!
                </p>

                {message && (
                  <div className="bg-background/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-secondary italic">&ldquo;{message}&rdquo;</p>
                  </div>
                )}

                {transactionId && (
                  <div className="text-xs text-secondary mb-6 font-mono">
                    Transaction ID: {transactionId.slice(0, 8)}...{transactionId.slice(-6)}
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setSuccess(false);
                      setAmount("");
                      setMessage("");
                      setTransactionId(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Gift
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Gift Form */}
          {!loading && !error && stashData && !success && (
            <div className="animate-fade-in-up">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 mb-6 animate-float">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span>Send a Gift</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  You are sending a gift to{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stashData.ownerName}&apos;s Stash
                  </span>
                </h1>
                
                <p className="text-lg text-secondary max-w-2xl mx-auto">
                  Help build their future! Your gift will be unlocked on{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(stashData.unlockDate)}
                  </span>
                </p>
              </div>

              {/* Stash Info Card */}
              <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-secondary mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stashData.balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary mb-1">Unlock Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatDate(stashData.unlockDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gift Form */}
              <form onSubmit={handleSubmit} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                      Gift Amount (FLOW)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-secondary">
                        $
                      </span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                        disabled={isSubmitting}
                        className="w-full pl-10 pr-4 py-4 text-2xl font-semibold bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[10, 25, 50, 100].map((quickAmount) => (
                        <button
                          key={quickAmount}
                          type="button"
                          onClick={() => setAmount(quickAmount.toString())}
                          disabled={isSubmitting}
                          className="px-3 py-2 text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ${quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Add a Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a heartfelt message..."
                      rows={3}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isLoggedIn ? "Sending Gift..." : "Connecting Wallet..."}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        {isLoggedIn ? "Send Gift" : "Connect Wallet to Send Gift"}
                      </>
                    )}
                  </Button>

                  {!isLoggedIn && (
                    <p className="text-xs text-center text-secondary">
                        You&apos;ll need to connect your Flow wallet to send a gift
                      </p>
                  )}
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-secondary">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secured by Flow Blockchain</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
