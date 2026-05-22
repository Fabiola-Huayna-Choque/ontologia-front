import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHIPAPU - Buscador Semántico de Series Televisivas",
  description: "Explora series, personajes, temporadas y reviews con búsqueda semántica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}