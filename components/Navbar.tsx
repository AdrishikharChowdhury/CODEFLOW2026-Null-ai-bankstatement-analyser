import { navlinks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

const Navbar = () => {
  return (
    <div className="relative z-10 bg-green-pea-1600 mx-6 my-4 rounded-2xl px-10 py-6 flex justify-between items-center text-lg border-2 border-green-pea-300">
      <Link href="/">
        <Image
          src={"/logo.png"}
          width={180}
          height={90}
          className="object-cover"
          alt="logo"
        />
      </Link>
      <ul className="flex justify-centr items-center gap-4">
        {navlinks.map((link, idx: number) => (
          <Link href={link.link} key={idx}>
            <li>{link.name}</li>
          </Link>
        ))}
      </ul>
      <div className="cta flex justify-center items-center gap-6">
        <Show when="signed-out">
          <SignInButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-2xl bg-green-pea-1900 border-2 border-green-pea-400 text-foreground transition-all hover:bg-green-pea-800">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="cursor-pointer w-max h-max py-4 px-8 rounded-2xl bg-green-pea-1900 border-2 border-green-pea-400 text-foreground transition-all hover:bg-green-pea-800">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
  appearance={{
    elements: {
      userButtonAvatarBox: "h-12 w-12",   // avatar size
      userButtonTrigger: "scale-200",      // or scale the whole trigger
    }
  }}
/>
        </Show>
      </div>
    </div>
  );
};

export default Navbar;
