"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Download, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Define types for Meme data structure
interface MemeData {
  id: string;
  title: string;
  uri: string;
  url?: string; // For compatibility if API returns url instead of uri
  width?: number;
  height?: number;
}

type MemeType = "gifs" | "pngs";

const memeGridVariants = cva("max-w-4xl md:max-w-6xl px-2", {
  variants: {
    columns: {
      1: "columns-1",
      2: "sm:columns-2",
      3: "md:columns-3",
      4: "lg:columns-4",
      5: "xl:columns-5",
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

const memeItemVariants = cva("break-inside-avoid", {
  variants: {
    spacing: {
      sm: "mb-4",
      md: "mb-6",
      lg: "mb-8",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

interface MemeCardProps {
  memeId: MemeData;
  index: number;
  type: MemeType;
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
      link.download = `${memeId.title || `meme-${memeId.id}`}.${type === "gifs" ? "gif" : "png"}`;
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
    <div
      className={`relative border-2 border-border bg-white shadow-none hover:shadow-light rounded-xl p-3`}
    >
      {!imageLoaded && (
        <div className="w-full h-48 bg-white border rounded-lg flex items-center justify-center">
          <span className="font-semibold">
            <DotLottieReact src="/loading-animation.lottie" loop autoplay />
          </span>
        </div>
      )}
      <img
        src={memeId.uri || memeId.url}
        alt={`Meme image ${memeId.title || memeId.id}`}
        className={`w-full h-auto rounded-lg border ${
          imageLoaded ? "" : "hidden"
        }`}
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
          className="p-2 rounded-full text-white shadow-md hover:bg-gray-100 transition-colors duration-200 hover:bg-main/70 hover:translate-x-0 hover:translate-y-0"
          aria-label="Download meme"
        >
          <Download size={20} />
        </Button>
        <Button
          onClick={handleEdit}
          className="p-2 rounded-full text-white shadow-md hover:bg-gray-100 transition-colors duration-200 hover:bg-main/70 hover:translate-x-0 hover:translate-y-0"
          aria-label="Edit meme"
        >
          <Edit size={20} />
        </Button>
      </div>
    </div>
  );
};

interface MemeGridProps extends VariantProps<typeof memeGridVariants> {
  memes: MemeData[];
  spacing?: VariantProps<typeof memeItemVariants>["spacing"];
  className?: string;
  type: MemeType;
}

export const MemeGrid: React.FC<MemeGridProps> = ({ 
  memes, 
  columns, 
  spacing, 
  className, 
  type 
}) => {
  return (
    <div className={cn(memeGridVariants({ columns }), className)}>
      {memes.map((memeId, i) => (
        <div
          key={`${memeId.id}-${i}`}
          className={cn(memeItemVariants({ spacing }))}
        >
          <MemeCard memeId={memeId} index={i} type={type} />
        </div>
      ))}
    </div>
  );
};

interface MemeGalleryProps {
  data: MemeData[];
  type: MemeType;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ data, type }) => {
  return (
    <div className="flex items-center justify-center md:mt- mt-8 md:p-8">
      <MemeGrid memes={data} type={type} />
    </div>
  );
};

export default MemeGallery;