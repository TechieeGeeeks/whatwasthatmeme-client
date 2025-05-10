"use client";
import React, {  useState } from "react";
import Hero from "@/components/home/hero";
import MainPaddingWrapper from "@/components/home/main-padding";
import { useRouter } from "next/navigation";

const Page = () => {
  const [inputTxt, setInputTxt] = useState<string>("");
  const router = useRouter();

  return (
    <MainPaddingWrapper>
      <Hero
        handleSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          router.push(`/search?q=${inputTxt}`);
        }}
        inputTxt={inputTxt}
        setInputTxt={setInputTxt}
      />
    </MainPaddingWrapper>
  );
};

export default Page;