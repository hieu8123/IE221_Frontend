import Image from "next/image";
import Link from "next/link";
import {
  IoLogoGithub,
  IoLogoFacebook,
  IoLogoYoutube,
  IoLogoInstagram,
} from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { FooterData } from "@/layouts/default/footer-info";

const Footer = (props) => {
  return (
    <footer
      className={`w-full ${
        props.dark
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 border-t border-gray-200"
      }`}
    >
      {/* Footer top */}
      <div className="py-10 border-b border-gray-200 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <Link href="/" aria-label="Trang chủ">
                <FaHome />
              </Link>
              <p className="text-lg font-bold">Hiếu Store</p>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" aria-label="facebook">
                <IoLogoFacebook className="text-xl text-gray-500 hover:text-blue-600" />
              </Link>
              <Link href="#" aria-label="instagram">
                <IoLogoInstagram className="text-xl text-gray-500 hover:text-pink-600" />
              </Link>
              <Link href="#" aria-label="github">
                <IoLogoGithub className="text-xl text-gray-500 hover:text-black" />
              </Link>
              <Link href="#" aria-label="youtube">
                <IoLogoYoutube className="text-xl text-gray-500 hover:text-red-600" />
              </Link>
            </div>

            {/* Footer Links */}
            {FooterData.footerLink.slice(0, 3).map((items, index) => (
              <div key={index}>
                <h5 className="font-bold mb-4">{items.label}</h5>
                <ul className="space-y-2">
                  {items.linkList.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.url}
                        className="text-sm text-gray-500 hover:text-blue-600"
                        aria-label={link.name}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Area */}
      <div className="py-6 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left Section */}
            <div className="container flex flex-col items-center justify-center text-center md:text-left">
              <ul className="flex flex-col items-center text-sm text-gray-500 gap-4">
                <li>
                  <Link
                    href="/privacy-policy"
                    aria-label="Privacy Policy"
                    className="hover:text-blue-500"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    aria-label="Terms of Service"
                    className="hover:text-blue-500"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <p className="mt-2 text-gray-400">
                © {new Date().getFullYear()}. All rights reserved by
                {" Lê Công Hiếu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
