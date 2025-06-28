import GifTextOverlay from "./gif-text-editor";
import { useSearchParams } from "next/navigation";
import React from "react";
import ImageTextOverlay from "./png-editor";

const EditMeme = () => {
  const searchParams = useSearchParams();
  const uri = searchParams.get("uri");
  const type = searchParams.get("type");

  return (
    <div>
      {type === "gifs" && (
        <>
          <GifTextOverlay gifURI={uri as string} />
        </>
      )}
      {type === "pngs" && (
        <>
          <ImageTextOverlay imgURI={uri as string} />
        </>
      )}
    </div>
  );
};

export default EditMeme;
