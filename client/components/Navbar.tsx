import { navlinks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { MobileNav } from "@/components/MobileNav";

const Navbar = () => {
  return (
    <div className="sticky top-3 z-50 mx-4 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border border-border bg-background/80 backdrop-blur-md shadow-sm">
      <Link href="/" className="flex items-center gap-2 shrink-0" >
        <div className="p-1.5 bg-primary/10 rounded-full">
          <Image
            src={"/logo.svg"}
            width={40}
            height={40}
            className="object-cover rounded-full"
            alt="logo"
          />
        </div>
        <h3 className="text-foreground font-bold text-base sm:text-lg tracking-tight hidden sm:block">
          Financialo
        </h3>
      </Link>

      <ul className="hidden md:flex items-center gap-4 text-muted-foreground">
        {navlinks.map((link, idx: number) => (
          <Link
            href={link.link}
            key={idx}
            className="transition-colors hover:text-primary relative group text-sm"
          >
            <li>{link.name}</li>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </ul>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <ThemeToggleButton />
        </div>
        <Show when="signed-out">
          <SignInButton>
            <button className="cursor-pointer w-max h-max py-2 px-4 sm:py-3 sm:px-6 rounded-sm border border-primary text-foreground transition-colors hover:bg-primary/10 text-xs sm:text-sm">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="cursor-pointer w-max h-max py-2 px-4 sm:py-3 sm:px-6 rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-primary/90 text-xs sm:text-sm">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/50 hover:ring-primary transition-all",
                userButtonTrigger: "scale-160",
              },
              userProfile: {
                elements: {
                  cardBox: "bg-card text-card-foreground shadow-xl border border-border",
                  modalBackdrop: "bg-black/60 backdrop-blur-sm",
                  rootBox: "bg-card",
                  page: "bg-card",
                  navbar: "bg-muted border-r border-border",
                  profileSection: "bg-card",
                  profilePage: "bg-card",
                },
              },
            }}
          />
        </Show>
        <MobileNav />
      </div>
    </div>
  );
};

export default Navbar;
