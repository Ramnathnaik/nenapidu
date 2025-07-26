import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useTheme from "../utils/store";

const Header = () => {
  const { darkMode, toggleDarkMode, toggleSidebar } = useTheme();

  return (
    <div className="flex justify-between items-center w-full px-4 sm:px-16 py-4 bg-white dark:bg-gray-900 shadow-2xl">
      <section className="flex items-center">
        <SignedIn>
          <Menu
            className="mr-4 cursor-pointer text-gray-700 dark:text-gray-300 md:hidden"
            onClick={toggleSidebar}
          />
        </SignedIn>
        <Link href="/" className="cursor-pointer">
          <Image
            src="/nenapidu-logo.png"
            alt="Nenapidu Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
            style={{ transform: "scale(1.5)" }}
            priority
          />
        </Link>
      </section>
      <section className="flex items-center">
        {darkMode ? (
          <Sun
            className="mr-4 cursor-pointer text-violet-400"
            onClick={toggleDarkMode}
          />
        ) : (
          <Moon
            className="mr-4 cursor-pointer text-gray-700 dark:text-gray-300"
            onClick={toggleDarkMode}
          />
        )}
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 transition-colors cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </section>
    </div>
  );
};

export default Header;
