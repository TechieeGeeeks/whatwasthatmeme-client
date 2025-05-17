"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export interface MemeGalleryMemeData {
  id: string;
  title: string;
  uri: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface MemeCardProps {
  memeId: MemeGalleryMemeData;
  index: number;
  type: "gifs" | "pngs";
}

const MemeCard: React.FC<MemeCardProps> = ({ memeId, index, type }) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);

  const handleDownload = async (): Promise<void> => {
    try {
      const imageUrl = memeId.uri || memeId.url;
      if (!imageUrl) {
        console.error("No image URL available");
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${memeId.title || `meme-${memeId.id}`}.${
        type === "gifs" ? "gif" : "png"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleEdit = (): void => {
    const queryParams = new URLSearchParams({
      id: memeId.id,
      title: memeId.title || "",
      uri: memeId.uri || memeId.url || "",
      type,
    }).toString();
    router.push(`/edit-meme?${queryParams}`);
  };

  return (
    <div className="relative border-2 border-border bg-white shadow-none hover:shadow-light p-3">
      {!imageLoaded && (
        <div className="w-full h-48 bg-white border flex items-center justify-center">
          <span className="font-semibold">
            <DotLottieReact src="/loading-animation.lottie" loop autoplay />
          </span>
        </div>
      )}
      <img
        src={memeId.uri || memeId.url}
        alt={`Meme image ${memeId.title || memeId.id}`}
        className={`w-full h-auto border ${imageLoaded ? "" : "hidden"}`}
        onLoad={() => setImageLoaded(true)}
      />
      <div className="mt-2 text-center font-bold text-shadow capitalize">
        {memeId?.title?.length > 20
          ? `${memeId.title.slice(0, 20)}...`
          : memeId.title}
      </div>
      <div className="absolute top-5 right-5 flex space-x-2">
        <Button
          onClick={handleDownload}
          className="p-2 text-white shadow-md transition-colors duration-200 hover:translate-x-0 hover:translate-y-0"
          aria-label="Download meme"
        >
          <Download size={20} />
        </Button>
        <Button
          onClick={handleEdit}
          className="p-2 text-white shadow-md transition-colors duration-200 hover:translate-x-0 hover:translate-y-0"
          aria-label="Edit meme"
        >
          <Edit size={20} />
        </Button>
      </div>
    </div>
  );
};

export default MemeCard;