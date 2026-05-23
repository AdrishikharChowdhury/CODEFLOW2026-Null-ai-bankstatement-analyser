import { navlinks } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="relative z-10 bg-green-pea-1600 mx-6 my-4 rounded-2xl p-5 flex justify-between items-center text-lg">
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
          <li key={idx}>{link.name}</li>
        ))}
      </ul>
      <div className="cta flex justify-center items-center gap-6">
        <Link
          href="/sign-in"
          className="w-max h-max py-4 px-8 rounded-2xl bg-green-pea-1900 border-2 border-green-pea-400"
        >
          Sign In
        </Link>
        <Link
          href="/log-in"
          className="w-max h-max py-4 px-8 rounded-2xl bg-green-pea-1900 border-2 border-green-pea-400"
        >
          Log In
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
