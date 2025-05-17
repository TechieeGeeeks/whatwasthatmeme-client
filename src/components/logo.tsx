import { Dela_Gothic_One } from "next/font/google";
import Link from "next/link";
import React from "react";

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: ["400"],
});

const BrandLogo: React.FC = () => {
  return (
    <Link href="/" className={delaGothicOne.className}>
      <p className="md:text-2xl hover:text-[#3300FF]">WhatWasThatMeme.org</p>
    </Link>
  );
};

export default BrandLogo;
