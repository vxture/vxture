import React from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./globals.css";

export const metadata = {
  title: "Vxture",
  description: "Vxture platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
