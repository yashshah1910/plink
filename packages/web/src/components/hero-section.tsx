'use client';

import { Button } from './ui/button';
import { SparklesIcon } from './ui/icons';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative container mx-auto px-4 py-24 sm:py-32 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 animate-float">
              <SparklesIcon className="w-4 h-4" />
              <span>Built on Flow Blockchain</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                A Digital Piggy Bank for{' '}
                <span className="bg-gradient-to-r bg-clip-text text-transparent">
                  Their Future
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-secondary leading-relaxed max-w-2xl">
                Create a time-locked Stash for your child, receive $FLOW gifts from family, 
                and build a permanent memory book of generosity on the Flow blockchain.{' '}
                <span className="text-sm text-muted-foreground">(USDC support coming soon!)</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your First Stash
                <SparklesIcon className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg">
              {/* Floating background elements */}
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" />
              <div className="absolute -bottom-16 -right-16 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" />
              
              {/* Main visual container */}
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 backdrop-blur-sm border border-primary/20 shadow-2xl">
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <SparklesIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white font-bold text-lg">$</span>
                </div>

                {/* Central content */}
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl animate-float">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Emma&apos;s Future Fund</h3>
                    <div className="text-3xl font-bold text-primary">$4,250</div>
                    <div className="text-sm text-secondary">Unlocks: Dec 2042</div>
                  </div>

                  <div className="space-y-3">
                    {/* Recent gifts */}
                    <div className="bg-muted/50 rounded-lg p-3 border border-border/50 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Grandma Susan</span>
                        <span className="text-accent font-medium">+$100</span>
                      </div>
                      <div className="text-xs text-secondary mt-1">&quot;Happy 5th birthday! 🎂&quot;</div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 border border-border/50 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Uncle Mike</span>
                        <span className="text-accent font-medium">+$50</span>
                      </div>
                      <div className="text-xs text-secondary mt-1">&quot;For your college fund! 📚&quot;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}