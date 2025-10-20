"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";
import AddFundsModal from "@/components/AddFundsModal";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
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
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStash, setSelectedStash] = useState<{ id: number; name: string } | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-float">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="text-lg text-secondary max-w-md mx-auto">
              Please connect your Flow wallet to access your dashboard and manage your Stashes
            </p>
            <Button onClick={logIn} size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 mb-6 animate-float">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Connected as {formatAddress(user?.addr || "")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Your Digital{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Stashes
              </span>
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
              Manage your time-locked savings accounts and watch your children's future grow
            </p>
          </div>

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
        {error && (
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
              <Button onClick={loadStashes} variant="outline" className="shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Stashes Content */}
        {!loading && !error && (
          <div className="animate-fade-in-up">
            {stashes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                  <svg
                    className="w-16 h-16 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">No Stashes Yet</h3>
                <p className="text-secondary text-lg mb-8 max-w-md mx-auto">
                  Create your first digital piggy bank to start saving for your
                  child's future. Build memories and secure their tomorrow.
                </p>
                <Link href="/dashboard/create">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Stash
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stashes.map((stash, index) => (
                  <div
                    key={stash.id}
                    className={`bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group card-slide-in delay-${Math.min(index * 100, 500)} relative`}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Stash Header */}
                    <div className="relative bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-xl mb-1">
                            {stash.ownerName}'s Stash
                          </h3>
                          <p className="text-primary-foreground/80 text-sm">
                            Unlocks on {formatDate(stash.unlockDate)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-6 space-y-6">
                      {/* Balance Display */}
                      <div className="text-center">
                        <p className="text-sm text-secondary mb-2">Current Balance</p>
                        <div className="text-3xl font-bold text-primary hover:scale-105 transition-transform cursor-default">
                          {formatAmount(stash.balance)} 
                          <span className="text-lg font-medium text-secondary ml-1">FLOW</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                          stash.isLocked 
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700' 
                            : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${stash.isLocked ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span>{stash.isLocked ? 'Locked' : 'Unlocked'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full button-hover-lift group border-2 hover:border-primary"
                          onClick={() => {
                            setSelectedStash({ id: stash.id, name: stash.ownerName });
                            setIsModalOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Funds</span>
                          </div>
                        </Button>
                        {!stash.isLocked && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full button-hover-lift group"
                            onClick={() => {
                              // TODO: Implement withdraw functionality
                              console.log("Withdraw from stash:", stash.id);
                            }}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Withdraw</span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
        
        {/* Footer */}
        <Footer />
        
        {/* Add Funds Modal */}
        <AddFundsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStash(null);
          }}
          stashId={selectedStash?.id || 0}
          stashName={selectedStash?.name || ''}
          onSuccess={() => {
            loadStashes(); // Refresh the stashes list
          }}
        />
      </div>
    </div>
  );
}
