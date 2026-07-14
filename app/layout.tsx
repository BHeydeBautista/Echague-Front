import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Club Atlético Echagüe — Desde 1932",
  description:
    "Concepto interactivo del futuro sitio de Club Atlético Echagüe. Tradición, prestigio y movimiento desde 1932, Paraná, Entre Ríos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full overflow-x-hidden bg-[#04060b] text-[#f2f3f6]">
        {children}
      </body>
    </html>
  );
}
