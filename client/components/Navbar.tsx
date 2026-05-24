import { navlinks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="sticky top-4 z-50 mx-6 rounded-2xl px-10 py-6 flex justify-between items-center text-lg border border-border bg-background/80 backdrop-blur-md shadow-sm">
      <Link href="/" className="flex items-center gap-3" >
        <div className="p-2 bg-primary/10 rounded-xl">
          <Image
            src={"/logo.svg"}
            width={35}
            height={35}
            className="object-cover rounded-lg"
            alt="logo"
          />
        </div>
        <h3 className="text-foreground font-bold text-xl tracking-tight">
              Financialo
            </h3>
      </Link>
      <ul className="flex justify-center items-center gap-4 md:flex text-muted-foreground">
        {navlinks.map((link, idx: number) => (
          <Link
            href={link.link}
            key={idx}
            className="transition-colors hover:text-primary relative group"
          >
            <li>{link.name}</li>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </ul>
      <div className="cta flex justify-center items-center gap-4">
        <Show when="signed-out">
          <SignInButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-xl border border-primary text-foreground transition-colors hover:bg-primary/10">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-12 w-12 ring-2 ring-primary/50 hover:ring-primary transition-all",
                userButtonTrigger: "scale-160",
              },
            }}
          />
        </Show>
      </div>
    </div>
  );
};

export default Navbar;
