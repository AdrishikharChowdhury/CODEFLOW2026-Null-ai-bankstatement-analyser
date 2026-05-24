import { navlinks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  return (
    <div className="relative z-10 glass neon-glow mx-6 my-4 rounded-2xl px-10 py-6 flex justify-between items-center text-lg border border-primary/30">
      <Link href="/">
        <Image
          src={"/logo.png"}
          width={180}
          height={90}
          className="object-cover transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]"
          alt="logo"
        />
      </Link>
      <ul className="flex justify-centr items-center gap-4 md:flex  text-muted-foreground terminal-text">
        {navlinks.map((link, idx: number) => (
          <Link
            href={link.link}
            key={idx}
            className="transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] relative group"
          >
            <li>{link.name}</li>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(0,255,136,0.8)]"></span>
          </Link>
        ))}
      </ul>
      <div className="cta flex justify-center items-center gap-4">
        <ThemeToggle />
        <Show when="signed-out">
          <SignInButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-xl glass border border-primary/50 text-foreground transition-all duration-300 hover:bg-primary/10 hover:border-primary hover:neon-glow terminal-text">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-xl bg-primary/10 border border-primary text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground neon-glow-strong terminal-text">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-12 w-12 ring-2 ring-primary/50 hover:ring-primary transition-all",
                userButtonTrigger: "scale-160", // or scale the whole trigger
              },
            }}
          />
        </Show>
      </div>
    </div>
  );
};

export default Navbar;
