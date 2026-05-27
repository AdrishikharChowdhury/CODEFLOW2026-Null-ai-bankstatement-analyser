import { Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background text-foreground px-4 sm:px-6 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="flex flex-col gap-3 sm:gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Financialo
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-xs">
              AI-powered bank statement analyser. Turn raw financial data into
              actionable insights with precision and ease.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm">
              <Link href="#home" className="text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
              <Link href="#about-us" className="text-muted-foreground transition-colors hover:text-foreground">
                About Us
              </Link>
              <Link href="#contact-us" className="text-muted-foreground transition-colors hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">
              Connect
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Reach out to the team behind Financialo for support or feedback.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="mailto:ec24.adrishikhar.chowdhury@stcet.ac.in"
                className="rounded-xl bg-muted border border-border p-2 sm:p-2.5 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://github.com/AdrishikharChowdhury"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-muted border border-border p-2 sm:p-2.5 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center text-[10px] sm:text-xs text-muted-foreground">
          &copy; {year} Team Null. All rights reserved. Built with passion for financial transparency.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
