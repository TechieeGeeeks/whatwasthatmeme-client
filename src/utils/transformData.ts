import crypto from "crypto";

const algorithm = "aes-256-cbc";
const YUP_API = process.env.YUP_API;

interface EncryptedData {
  iv: string;
  encryptedData: string;
}

interface GifMediaFormat {
  url: string;
  [key: string]: any;
}

interface GifItem {
  content_description?: string;
  title?: string;
  url?: string;
  media_formats?: {
    gif?: GifMediaFormat;
    [key: string]: any;
  };
  [key: string]: any;
}

interface DecryptedGifData {
  results: GifItem[];
  next?: string;
  [key: string]: any;
}

interface PngData {
  results: any[];
  [key: string]: any;
}

interface MemeData {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

interface TransformResult {
  nextValue: string | undefined;
  result: MemeData[];
}

const decrypt = (encryptedData: EncryptedData): string => {
  if (!YUP_API) {
    throw new Error("YUP_API environment variable is not set");
  }
  
  const key = Buffer.from(YUP_API, "hex");
  const iv = Buffer.from(encryptedData.iv, "hex");
  const encryptedText = Buffer.from(encryptedData.encryptedData, "hex");

  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const transformData = async (
  data: EncryptedData | PngData,
  type: "gifs" | "pngs"
): Promise<TransformResult> => {
  try {
    let decryptedData: DecryptedGifData | PngData;
    
    if (type === "gifs") {
      const decryptedDataString = decrypt(data as EncryptedData);
      decryptedData = JSON.parse(decryptedDataString) as DecryptedGifData;
    } else {
      decryptedData = data as PngData;
    }

    const nextValue = decryptedData.next;

    return {
      nextValue,
      result: decryptedData.results.map((item) => ({
        id: type === "gifs" 
          ? (item as GifItem).id || `gif-${Math.random().toString(36).substring(2, 15)}`
          : `png-${Math.random().toString(36).substring(2, 15)}`,
        title: type === "gifs" 
          ? (item as GifItem).content_description || (item as GifItem).title || ""
          : "",
        url: type === "gifs"
            ? (item as GifItem).media_formats?.gif?.url || (item as GifItem).url || ""
            : item,
        width: type === "gifs"
            ? ((item as GifItem).media_formats?.gif?.width || 300)
            : 300,
        height: type === "gifs"
            ? ((item as GifItem).media_formats?.gif?.height || 300)
            : 300,
      })),
    };
  } catch (error) {
    console.error("Error in transformData:", error);
    throw new Error("Failed to decrypt or transform data");
  }
};