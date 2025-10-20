"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useUser } from "@/context/UserContext";
import PlinkLogo from "@/assets/images/PlinkLogo.png";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logIn, logOut, isLoggedIn, address, loading } = useUser();

  // Function to format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Image src={PlinkLogo} alt="Plink Logo" width={48} height={48} />
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          {loading ? (
            <div className="w-24 h-8 bg-muted animate-pulse rounded"></div>
          ) : isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>

              {/* Primary CTA for creating a new stash (desktop) */}
              <Link href="/dashboard/create">
                <Button variant="primary" size="sm" className="hidden md:inline-flex">
                  Create New Stash
                </Button>
              </Link>

              <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono">
                  {formatAddress(address)}
                </span>
              </div>
              <Button onClick={logOut} variant="secondary" size="sm">
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button onClick={logIn} variant="outline" size="sm">
                Connect Wallet
              </Button>
              <Link href="/dashboard/create">
                <Button variant="primary" size="sm">
                  Create Your First Stash
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            {loading ? (
              <div className="w-full h-8 bg-muted animate-pulse rounded"></div>
            ) : isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono">
                    {formatAddress(address)}
                  </span>
                </div>
                <Link href="/dashboard/create">
                  <Button variant="primary" size="sm" className="w-full">
                    Create New Stash
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={logOut}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={logIn}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Connect Wallet
                </Button>
                <Link href="/dashboard/create">
                  <Button variant="primary" size="sm" className="w-full">
                    Create Your First Stash
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
