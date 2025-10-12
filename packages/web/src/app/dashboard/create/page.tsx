"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as fcl from "@onflow/fcl";

export default function CreateStash() {
  const { user, isLoggedIn, logIn } = useUser();
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
        import Plink from 0xf8d6e0586b0a20c7

        transaction(ownerName: String, unlockDate: UFix64) {
          prepare(signer: auth(Storage, Capabilities) &Account) {
            // Check if a Plink Collection already exists at the storage path
            if signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath) == nil {
              // Create a new empty collection and save it to the account's storage
              signer.storage.save(<-Plink.createEmptyCollection(), to: Plink.CollectionStoragePath)
              
              // Create and publish a public capability
              let capability = signer.capabilities.storage.issue<&{Plink.CollectionPublic}>(Plink.CollectionStoragePath)
              signer.capabilities.publish(capability, at: Plink.CollectionPublicPath)
            }
            
            // Create the new Stash
            let newStash <- Plink.createStash(ownerName: ownerName, unlockDate: unlockDate)
            
            // Deposit the Stash into the user's Collection
            let collectionRef = signer.storage.borrow<&Plink.Collection>(from: Plink.CollectionStoragePath)
              ?? panic("Could not borrow a reference to the Stash Collection")
            
            collectionRef.deposit(stash: <-newStash)

            log("✅ Stash created successfully for ".concat(ownerName))
          }
        }
      `;

      const transactionId = await fcl.mutate({
        cadence: createStashTransaction,
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
    } catch (err: any) {
      console.error("Error creating stash:", err);
      setError(err.message || "Failed to create stash. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your Flow wallet to create a stash
          </p>
          <Button onClick={logIn} size="lg">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Create New Stash</h1>
          <p className="text-muted-foreground mt-2">
            Set up a digital piggy bank for your child's future
          </p>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child's Name */}
            <div>
              <label
                htmlFor="childName"
                className="block text-sm font-medium mb-2"
              >
                Child's Name
              </label>
              <input
                type="text"
                id="childName"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                placeholder="Enter your child's name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
            </div>

            {/* Unlock Date */}
            <div>
              <label
                htmlFor="unlockDate"
                className="block text-sm font-medium mb-2"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The stash will be locked until this date
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Stash...
                </div>
              ) : (
                "Create Stash"
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              How it works
            </h3>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Your stash will be created on the Flow blockchain</li>
              <li>• It will be locked until the unlock date you specify</li>
              <li>• Family and friends can add funds to the stash</li>
              <li>• Funds can only be withdrawn after the unlock date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
