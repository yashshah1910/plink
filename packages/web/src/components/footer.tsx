import Image from "next/image";
import PlinkLogo from "@/assets/images/PlinkLogo.png";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg w-max">
              <Image
                src={PlinkLogo}
                alt="Plink Logo"
                width={48}
                height={48}
                className="rounded-md"
              />
            </div>
            <p className="text-secondary max-w-md">
              Save for the future, one plink at a time. Building secure,
              time-locked digital piggy banks for the next generation.
            </p>
            <div className="flex items-center space-x-4">
              {/* Social Links */}
              <a
                href="#"
                className="w-8 h-8 bg-muted hover:bg-primary/10 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <div className="space-y-2">
              <a
                href="#features"
                className="block text-secondary hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-secondary hover:text-foreground transition-colors"
              >
                How it Works
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-secondary hover:text-foreground transition-colors"
              >
                FAQs
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-secondary text-sm">
            © 2025 Plink. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-secondary hover:text-foreground transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-secondary hover:text-foreground transition-colors text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
