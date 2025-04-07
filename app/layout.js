import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ask AI - Get answers to your questions using AI",
  description: "Ask AI is a platform that generates answers to your questions using AI.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body
            className={`${inter.className} antialiased`}
          >
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
