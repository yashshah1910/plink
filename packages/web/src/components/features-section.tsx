import { HeartIcon, ShieldIcon, RefreshIcon, SparklesIcon } from './ui/icons';

export function FeaturesSection() {
  const features = [
    {
      icon: HeartIcon,
      title: 'The Digital Memory Book',
      description: 'Every gift comes with a personal message that\'s permanently stored on the blockchain, creating a treasured collection of love and memories for your child\'s future.',
      highlight: 'Forever preserved',
    },
    {
      icon: ShieldIcon,
      title: 'Time-Locked Security',
      description: 'Funds are securely locked until your chosen date using smart contracts. Complete peace of mind with self-custody and decentralized protection.',
      highlight: 'Bank-grade security',
    },
    {
      icon: RefreshIcon,
      title: 'Recurring Gifts',
      description: 'Set up automatic monthly or annual contributions. Family members can create sustainable giving patterns that build substantial savings over time.',
      highlight: 'Set and forget',
    },
    {
      icon: SparklesIcon,
      title: 'USDC Stability',
      description: 'All contributions are made in USDC, protecting your child\'s fund from crypto volatility while still leveraging blockchain benefits.',
      highlight: 'Stable value',
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Built for Families, Powered by Blockchain
          </h2>
          <p className="text-lg text-secondary max-w-3xl mx-auto">
            Plink combines the security and permanence of blockchain technology with 
            the simplicity your family needs to save for the future.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-gradient-to-br from-background to-muted/30 rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                {/* Highlight badge */}
                <div className="absolute -top-3 -right-3 bg-accent text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                  {feature.highlight}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to create lasting memories?
            </h3>
            <p className="text-secondary mb-6 max-w-2xl mx-auto">
              Join thousands of families who are already building their children&apos;s future with Plink.
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}