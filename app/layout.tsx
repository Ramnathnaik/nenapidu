import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import ThemeWrapper from "./components/ThemeWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nenapidu - Never Miss a Special Moment",
  description: "Organize your life with intelligent reminders, beautiful profiles, and seamless event management. Keep track of what matters most to you and your loved ones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body>
          <ThemeWrapper>
            <div className="flex w-full">
              <SignedIn>
                <Sidebar />
              </SignedIn>
              <main className="flex-1">{children}</main>
            </div>
          </ThemeWrapper>
        </body>
      </ClerkProvider>
    </html>
  );
}
