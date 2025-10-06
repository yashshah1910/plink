import { VaultIcon, LinkIcon, GrowthIcon } from './ui/icons';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: VaultIcon,
      title: 'Create a Stash',
      description: 'Set up a secure, time-locked digital piggy bank for your child with a future unlock date.',
    },
    {
      number: '02',
      icon: LinkIcon,
      title: 'Share the Link',
      description: 'Send a simple, friendly link to family and friends. No wallet addresses or crypto complexity.',
    },
    {
      number: '03',
      icon: GrowthIcon,
      title: 'Watch it Grow',
      description: 'Track contributions and messages as your child\'s future fund grows with love and generosity.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Creating a secure future fund for your child has never been easier. 
            Just three simple steps to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connection line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                {/* Step card */}
                <div className="relative bg-background rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-lg transition-all duration-300 group-hover:border-primary/30">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 mb-6">
            <span>✨ Ready in under 2 minutes</span>
          </div>
          <div>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
              Start Building Their Future
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}