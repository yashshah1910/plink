'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import * as fcl from '@onflow/fcl';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stashId: number;
  stashName: string;
  onSuccess: () => void;
}

export default function AddFundsModal({
  isOpen,
  onClose,
  stashId,
  stashName,
  onSuccess,
}: AddFundsModalProps) {
  const { user } = useUser();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!user?.addr) {
      setError('User not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const addFundsTransaction = `
        import Plink from 0xf8d6e0586b0a20c7

        transaction(recipientAddress: Address, stashID: UInt64, amount: UFix64) {
          prepare(signer: auth(Storage, Capabilities) &Account) {
            let collectionRef = getAccount(recipientAddress)
              .capabilities.borrow<&{Plink.CollectionPublic}>(Plink.CollectionPublicPath)
              ?? panic("Could not borrow recipient's Collection")

            let stashRef = collectionRef.borrowStash(id: stashID)
              ?? panic("Could not borrow Stash in Collection")
            
            stashRef.deposit(amount: amount)

            log("✅ Successfully deposited funds.")
          }
        }
      `;

      const transactionId = await fcl.mutate({
        cadence: addFundsTransaction,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [
          arg(user.addr, t.Address),
          arg(stashId.toString(), t.UInt64),
          arg(parseFloat(amount).toFixed(2), t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed();
      
      if (result.status === 4) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: unknown) {
      console.error('Error adding funds:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to add funds. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Modal Panel */}
        <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Add Funds</h2>
                <p className="text-blue-100 text-sm">To {stashName}&apos;s Stash</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Funds Added Successfully!
                </h3>
                  <p className="text-muted-foreground text-sm">
                  {amount} FLOW has been added to {stashName}&apos;s stash
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Amount (FLOW)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      className="w-full px-4 py-3 text-lg border border-border rounded-xl bg-muted/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-center font-mono"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-muted-foreground font-medium">FLOW</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum amount: 0.01 FLOW
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium mb-2">Quick amounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['1', '5', '10', '25'].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount)}
                        className="py-2 px-3 text-sm border border-border rounded-lg hover:bg-muted/80 transition-colors"
                        disabled={isLoading}
                      >
                        {quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg button-hover-lift relative overflow-hidden"
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-white/60 rounded-full animate-spin animation-delay-150" />
                      </div>
                      <span>Processing Transaction...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add {amount || '0'} FLOW</span>
                    </div>
                  )}
                  
                  {/* Shimmer effect when not loading */}
                  {!isLoading && (
                    <div className="absolute inset-0 -top-px animate-shimmer opacity-0 hover:opacity-100 transition-opacity" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}