import { Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-green-pea-800 bg-green-pea-1900 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-green-pea-50">
              Financialo
            </h3>
            <p className="text-sm leading-relaxed text-green-pea-300">
              AI-powered bank statement analyser. Turn raw financial data into
              actionable insights.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-green-pea-400">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#home" className="text-green-pea-300 transition-colors hover:text-green-pea-100">
                Home
              </Link>
              <Link href="#about-us" className="text-green-pea-300 transition-colors hover:text-green-pea-100">
                About Us
              </Link>
              <Link href="#contact-us" className="text-green-pea-300 transition-colors hover:text-green-pea-100">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-green-pea-400">
              Connect
            </h4>
            <p className="text-sm text-green-pea-300">
              Reach out to the team behind Financialo.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:ec24.adrishikhar.chowdhury@stcet.ac.in"
                className="rounded-full border border-green-pea-700 p-2 text-green-pea-400 transition-colors hover:border-green-pea-400 hover:bg-green-pea-800/50 hover:text-green-pea-100"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/AdrishikharChowdhury"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-pea-700 p-2 text-green-pea-400 transition-colors hover:border-green-pea-400 hover:bg-green-pea-800/50 hover:text-green-pea-100"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-pea-800 pt-6 text-center text-xs text-green-pea-500">
          &copy; {year} Team Null. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
