"use client";
import React, { useState } from "react";
import MainPaddingWrapper from "./home/main-padding";
import BrandLogo from "./logo";
import { Mail, Instagram, Twitter, LucideIcon } from "lucide-react";
import { SocialDropdown } from "./home/social-dropdown";

type SocialLink = {
  icon: LucideIcon;
  href: string;
  label: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const socialLinks: SocialLink[] = [
    { icon: Mail, href: "mailto:0xswayam@gmail.com", label: "Email" },
    {
      icon: Instagram,
      href: "https://www.instagram.com/whatwasthatmeme",
      label: "Instagram",
    },
    {
      icon: Twitter,
      href: "https://twitter.com/whatwasthatmeme",
      label: "X (Twitter)",
    },
  ];

  return (
    <MainPaddingWrapper>
      <div className="w-full flex items-center justify-between">
        <BrandLogo />
        <div className="flex gap-8 items-center">
          <SocialDropdown />
        </div>
      </div>
    </MainPaddingWrapper>
  );
};

export default Navbar;
