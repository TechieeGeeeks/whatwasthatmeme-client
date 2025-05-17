import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import AuthWrapper from "@/auth/auth-provider";

import { WHATWASTHATMEME_METADATA } from "@/utils/constants";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = WHATWASTHATMEME_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthWrapper>
          <>
            <Navbar />
            {children}
          </>
        </AuthWrapper>
      </body>
    </html>
  );
}
