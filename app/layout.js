import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import "./prism.css"

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
            <Toaster toastOptions={
              {
                success: {style: { background: "black", color: "white" }},
                error: {style: { background: "black", color: "white" }}
            }
           } />
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
