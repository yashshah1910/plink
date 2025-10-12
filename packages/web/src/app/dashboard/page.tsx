"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";
import * as fcl from "@onflow/fcl";

interface Stash {
  id: number;
  ownerName: string;
  unlockDate: number;
  balance: number;
  isLocked: boolean;
}

export default function Dashboard() {
  const { user, isLoggedIn, logIn } = useUser();
  const [stashes, setStashes] = useState<Stash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && user?.addr) {
      loadStashes();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  const loadStashes = async () => {
    if (!user?.addr) return;

    try {
      setLoading(true);

      const getStashesScript = `
        import Plink from 0xf8d6e0586b0a20c7

        access(all) struct StashInfo {
          access(all) let id: UInt64
          access(all) let ownerName: String
          access(all) let unlockDate: UFix64
          access(all) let balance: UFix64
          access(all) let isLocked: Bool

          init(id: UInt64, ownerName: String, unlockDate: UFix64, balance: UFix64, isLocked: Bool) {
            self.id = id
            self.ownerName = ownerName
            self.unlockDate = unlockDate
            self.balance = balance
            self.isLocked = isLocked
          }
        }

        access(all) fun main(address: Address): [StashInfo] {
          let account = getAccount(address)
          let collectionRef = account.capabilities.borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
          
          if collectionRef == nil {
            return []
          }
          
          let ids = collectionRef!.getIDs()
          let stashInfos: [StashInfo] = []
          
          for id in ids {
            if let stashRef = collectionRef!.borrowStash(id: id) {
              let currentTime = getCurrentBlock().timestamp
              let isLocked = currentTime < stashRef.unlockDate
              
              stashInfos.append(StashInfo(
                id: id,
                ownerName: stashRef.ownerName,
                unlockDate: stashRef.unlockDate,
                balance: stashRef.getBalance(),
                isLocked: isLocked
              ))
            }
          }
          
          return stashInfos
        }
      `;

      const result = await fcl.query({
        cadence: getStashesScript,
        args: (arg: any, t: any) => [arg(user.addr, t.Address)],
      });

      if (result && Array.isArray(result)) {
        setStashes(result);
      } else {
        setStashes([]);
      }
    } catch (err) {
      console.error("Error loading stashes:", err);
      setError("Failed to load stashes");
      setStashes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

const formatAmount = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
};

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your Flow wallet to access your dashboard
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Stashes</h1>
            <p className="text-muted-foreground">
              Connected as {formatAddress(user?.addr || "")}
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button size="lg">Create New Stash</Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium">
              Error
            </h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
            <Button onClick={loadStashes} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Stashes Grid */}
        {!loading && !error && (
          <>
            {stashes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Stashes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first digital piggy bank to start saving for your
                  child's future
                </p>
                <Link href="/dashboard/create">
                  <Button size="lg">Create Your First Stash</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stashes.map((stash) => (
                  <div
                    key={stash.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Stash Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                      <h3 className="font-semibold text-lg">
                        {stash.ownerName}'s Stash
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Unlocks on {formatDate(stash.unlockDate)}
                      </p>
                    </div>

                    {/* Balance */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">
                          Current Balance
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatAmount(stash.balance)} FLOW
                        </span>
                      </div>

                      {/* Status */}
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              stash.isLocked ? "bg-red-500" : "bg-green-500"
                            }`}
                          ></div>
                          <span className="text-sm">
                            {stash.isLocked ? "Locked" : "Unlocked"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // TODO: Implement add funds functionality
                            console.log("Add funds to stash:", stash.id);
                          }}
                        >
                          Add Funds
                        </Button>
                        {!stash.isLocked && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // TODO: Implement withdraw functionality
                              console.log("Withdraw from stash:", stash.id);
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
