import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "RoosterCode Help Desk",
  description: "Walking skeleton",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
