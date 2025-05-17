"use client";
import React from "react";
import MainPaddingWrapper from "./home/main-padding";
import BrandLogo from "./logo";
import { SocialDropdown } from "./home/social-dropdown";

const Navbar = () => {
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
