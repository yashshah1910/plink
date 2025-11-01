"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import * as fcl from "@onflow/fcl";

export default function CreateStash() {
  const { isLoggedIn, logIn } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    childName: "",
    unlockDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.childName.trim()) {
      setError("Please enter your child's name");
      return;
    }

    if (!formData.unlockDate) {
      setError("Please select an unlock date");
      return;
    }

    // Convert date to Unix timestamp
    const unlockTimestamp = new Date(formData.unlockDate).getTime() / 1000;

    // Validate unlock date is in the future
    if (unlockTimestamp <= Date.now() / 1000) {
      setError("Unlock date must be in the future");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createStashTransaction = `
        import Plink from 0x99aa32ecca179759
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowTransactionScheduler from 0x8c5303eaa26202d6

        transaction(ownerName: String, unlockDate: UFix64) {
          prepare(signer: auth(Storage, Capabilities, IssueStorageCapabilityController, PublishCapability, SaveValue, BorrowValue) &Account) {
            
            // Step 1: Set up the Collection if it doesn't exist
            if signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath) == nil {
              signer.storage.save(<-Plink.createEmptyCollection(), to: Plink.CollectionStoragePath)
              
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
            
            // Step 4: Schedule automatic unlock if unlock date is in the future
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
                data: stashID,
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

                // Store the scheduled transaction ID using the contract function
                let collectionAuthRef = signer.storage.borrow<auth(Mutate) &Plink.Collection>(from: Plink.CollectionStoragePath)
                  ?? panic("Could not borrow authorized Collection reference")
                
                Plink.scheduleUnlock(collectionRef: collectionAuthRef, stashID: stashID, scheduledTransactionID: scheduledID)

                destroy scheduledTransaction

                log("✅ Scheduled automatic unlock at timestamp ".concat(unlockDate.toString())
                  .concat(". Scheduled transaction ID: ").concat(scheduledID.toString()))
              }
            }
          }
        }
      `;

      const transactionId = await fcl.mutate({
        cadence: createStashTransaction,
        // fcl args expect specific runtime 'arg' and 't' types from @onflow/fcl
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [
          arg(formData.childName.trim(), t.String),
          arg(unlockTimestamp.toFixed(1), t.UFix64),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed();

      if (result.status === 4) {
        // Success - redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err: unknown) {
      console.error("Error creating stash:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to create stash. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-float">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-secondary max-w-md mx-auto">
              Please connect your Flow wallet to create a new Stash
            </p>
            <Button
              onClick={logIn}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      {/* Header */}
      <Header />

      <div className="relative">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 mb-6 animate-float hover:bg-primary/20 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Create New{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Stash
              </span>
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Set up a digital piggy bank for your child&apos;s future and watch
              their savings grow
            </p>
          </div>

          {/* Form Container */}
          <div className="max-w-lg mx-auto">
            <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Child's Name */}
                <div>
                  <label
                    htmlFor="childName"
                    className="block text-sm font-semibold mb-3 text-foreground"
                  >
                    Child&apos;s Name
                  </label>
                  <input
                    type="text"
                    id="childName"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    placeholder="Enter your child&apos;s name"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-muted/50 text-foreground placeholder-secondary"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Unlock Date */}
                <div>
                  <label
                    htmlFor="unlockDate"
                    className="block text-sm font-semibold mb-3 text-foreground"
                  >
                    Unlock Date
                  </label>
                  <input
                    type="date"
                    id="unlockDate"
                    name="unlockDate"
                    value={formData.unlockDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-muted/50 text-foreground"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-secondary mt-2 flex items-center space-x-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>The stash will be locked until this date</span>
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-red-600 dark:text-red-300 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg button-hover-lift relative overflow-hidden"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-white/60 rounded-full animate-spin animation-delay-150" />
                      </div>
                      <span>Creating Stash...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Create Stash</span>
                    </div>
                  )}

                  {/* Shimmer effect when not loading */}
                  {!loading && (
                    <div className="absolute inset-0 -top-px animate-shimmer opacity-0 hover:opacity-100 transition-opacity" />
                  )}
                </Button>
              </form>

              {/* Info Section */}
              <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>How it works</span>
                </h3>
                <ul className="text-xs text-secondary space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Your stash will be created on the Flow blockchain
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      It will be locked until the unlock date you specify
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Family and friends can add funds to the stash</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Funds can only be withdrawn after the unlock date
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
