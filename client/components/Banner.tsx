import DotGrid from "./DotGrid";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, ShieldCheck, Sparkles } from "lucide-react";

const Banner = () => {
  return (
    <div className="w-full h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none hidden md:block" />

      <div id="home" className="w-full h-full z-0 relative">
        <DotGrid
          dotSize={5}
          gap={20}
          baseColor="#3b82f6"
          activeColor="#00F9FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-3 sm:px-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 text-sm sm:text-sm font-semibold tracking-wide text-primary uppercase bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse hidden sm:block" />
              AI-Powered Financial Analytics
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
              {/* Left - Main text (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4 lg:gap-5 p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-center sm:text-left">
                  Welcome to <br className="sm:hidden" /> <span className="text-primary">Financialo</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-lg text-center sm:text-left">
                  Turn your bank statements into actionable financial insights with the power of AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-start">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
                      <Sparkles className="size-3.5 sm:size-4" />
                      Analyze Your Statement
                    </button>
                  </Link>
                  <Link href="#about-us" className="w-full sm:w-auto">
                    <button className="cursor-pointer w-full sm:w-auto flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-foreground font-medium text-xs sm:text-sm transition-all hover:bg-white/30 dark:hover:bg-white/10">
                      Learn More
                    </button>
                  </Link>
                </div>

                {/* Trust */}
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground pt-1">
                  <div className="flex -space-x-2">
                    <Image src="/avatars/user1.svg" width={24} height={24} className="rounded-full border-2 border-background" alt="" />
                    <Image src="/avatars/user2.svg" width={24} height={24} className="rounded-full border-2 border-background" alt="" />
                    <Image src="/avatars/user3.svg" width={24} height={24} className="rounded-full border-2 border-background" alt="" />
                  </div>
                  <span>Trusted by 1000+ users</span>
                </div>
              </div>

              {/* Right - Logo display (2 cols) */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
                <div className="p-3 sm:p-4 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                  <Image
                    src="/logo.svg"
                    width={140}
                    height={140}
                    className="object-cover rounded-xl w-24 sm:w-28 md:w-36 lg:w-[180px]"
                    alt="Financialo logo"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs">
                  Intelligent analysis powered by cutting-edge machine learning
                </p>
              </div>
            </div>

            {/* Bottom row - Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
              {[
                { label: "AI Analysis", icon: Sparkles },
                { label: "Fraud Detection", icon: ShieldCheck },
                { label: "Smart Reports", icon: TrendingUp },
                { label: "Expense Tracking", icon: TrendingDown },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-muted-foreground"
                >
                  <Icon className="size-2.5 sm:size-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </DotGrid>
      </div>
    </div>
  );
};

export default Banner;
