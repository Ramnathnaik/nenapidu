"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import DashboardPage from "./(pages)/dashboard/page";
import LandingPage from "./components/LandingPage";

export default function Home() {
  return (
    <>
      <SignedIn>
        <DashboardPage />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}
