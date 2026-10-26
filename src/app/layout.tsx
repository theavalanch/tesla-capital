import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TESLA | Premium Investment Platform",
  description: "Accelerating the world's transition to sustainable energy. Own a part of Tesla. Back innovation, sustainable energy, and next-generation mobility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#08090C] text-[#F3F4F6] antialiased min-h-screen selection:bg-[#E82127] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
