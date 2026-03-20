import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Bookshelf - PDF Audio Overview Generator",
  description: "Upload PDF books and generate Spanish audio overviews with NotebookLM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}