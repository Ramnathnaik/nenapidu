"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import DashboardPage from "./(pages)/dashboard/page";

export default function Home() {
  return (
    <>
      <SignedIn>
        <DashboardPage />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <p className="text-2xl text-gray-500 dark:text-gray-400">
            Please sign in to view your dashboard
          </p>
        </div>
      </SignedOut>
    </>
  );
}
