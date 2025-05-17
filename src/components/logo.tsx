import { Dela_Gothic_One } from "next/font/google";
import React from "react";

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: ["400"],
});

const BrandLogo: React.FC = () => {
  return (
    <a href="/" className={delaGothicOne.className}>
      <p className="md:text-2xl hover:text-[#3300FF]">WhatWasThatMeme.org</p>
    </a>
  );
};

export default BrandLogo;