'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/PlinkLogo.jpeg"
            alt="Plink Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-xl text-foreground">Plink</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#features" 
            className="text-secondary hover:text-foreground transition-colors font-medium"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-secondary hover:text-foreground transition-colors font-medium"
          >
            How it Works
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            Connect Wallet
          </Button>
        </div>

        {/* Mobile Menu Button */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            <a 
              href="#features" 
              className="block text-secondary hover:text-foreground transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block text-secondary hover:text-foreground transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <Button variant="outline" size="sm" className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}