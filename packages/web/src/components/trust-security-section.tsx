export function TrustSecuritySection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Trusted by Families, Secured by Blockchain
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Your family&apos;s savings are protected by industry-leading security standards 
            and decentralized blockchain technology.
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Security features */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Self-Custody & Decentralized</h3>
                  <p className="text-secondary">Your family maintains complete control. No central authority can access or freeze your funds.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Smart Contract Security</h3>
                  <p className="text-secondary">Time-locks are enforced by audited smart contracts, ensuring funds remain secure until the unlock date.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Transparent & Verifiable</h3>
                  <p className="text-secondary">All transactions are recorded on the public blockchain, providing complete transparency and auditability.</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/50">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-secondary">Self-custody</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-foreground">$0</div>
                <div className="text-sm text-secondary">Funds at risk</div>
              </div>
            </div>
          </div>

          {/* Partners/Technology */}
          <div className="space-y-8">
            {/* Built on Flow */}
            <div className="bg-background rounded-2xl p-8 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Built on Flow Blockchain</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">F</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Flow</div>
                  <div className="text-sm text-secondary">Fast, secure, developer-friendly</div>
                </div>
              </div>
              <p className="text-secondary text-sm">
                Flow is a next-generation blockchain designed for mainstream adoption, 
                providing the security your family needs with the speed users expect.
              </p>
            </div>

            {/* Powered by USDC */}
            <div className="bg-background rounded-2xl p-8 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Powered by USDC</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent font-bold text-lg">$</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">USD Coin</div>
                  <div className="text-sm text-secondary">1:1 backed by US dollars</div>
                </div>
              </div>
              <p className="text-secondary text-sm">
                USDC provides the stability of traditional savings with the benefits of blockchain technology. 
                Your gifts maintain their value over time.
              </p>
            </div>

            {/* Security badge */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium border border-accent/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Smart contracts audited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}