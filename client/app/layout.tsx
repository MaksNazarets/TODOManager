import type { Metadata } from "next";
import { Alegreya_Sans, Alegreya_Sans_SC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./utils/AuthContext";

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const alegreyaSansSC = Alegreya_Sans_SC({
  variable: "--font-alegreya-sans-sc",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const metadata: Metadata = {
  title: "TODO Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`flex justify-center min-w-screen min-h-screen ${alegreyaSans.variable} ${alegreyaSansSC.variable} bg-mblue-900 antialiased h-screen`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
