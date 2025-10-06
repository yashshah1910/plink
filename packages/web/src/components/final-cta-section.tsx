import { Button } from './ui/button';
import { SparklesIcon } from './ui/icons';

export function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_50%)] dark:bg-grid-slate-700/25" />
        
        <div className="relative space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Ready to start their future fund?
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Join thousands of families building their children&apos;s future with secure, 
              blockchain-powered savings that grow with love.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="group shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4"
            >
              Create Your First Stash
              <SparklesIcon className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 text-lg px-8 py-4"
            >
              Learn More
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-secondary">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free to create</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Setup in 2 minutes</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bank-grade security</span>
            </div>
          </div>

          {/* Small testimonial */}
          <div className="pt-8">
            <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 max-w-lg mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SM</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Sarah M.</div>
                  <div className="text-xs text-secondary">Mom of 2</div>
                </div>
              </div>
              <p className="text-secondary text-sm italic">
                &quot;Plink made it so easy for our family to contribute to Emma&apos;s future. 
                The messages from grandparents are priceless memories.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}