import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer, toast } from "react-toastify";
import LayoutWithRole from "@/layouts";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Hieu store",
  description: "Shop bán đồ công nghệ uy tín",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWithRole>{children}</LayoutWithRole>
        <ToastContainer />
      </body>
    </html>
  );
}
