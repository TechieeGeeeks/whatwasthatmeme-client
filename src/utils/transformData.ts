import crypto from "crypto";

const algorithm = "aes-256-cbc";
const YUP_API = process.env.YUP_API;

export interface EncryptedData {
  iv: string;
  encryptedData: string;
}

interface GifMediaFormat {
  url: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface GifItem {
  id?: string;
  content_description?: string;
  title?: string;
  url?: string;
  media_formats?: {
    gif?: GifMediaFormat;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DecryptedGifData {
  results: GifItem[];
  next?: string;
  [key: string]: unknown;
}

export interface PngData {
  results: Array<string | Record<string, unknown>>;
  next?: string;
  [key: string]: unknown;
}

export interface GifApiResponse {
  results: Array<Record<string, unknown>>;
  next?: string;
}

export interface MemeApiResponse {
  results: Array<Record<string, unknown>>;
}

export interface MemeData {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

export interface TransformResult {
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

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

function isEncryptedData(data: unknown): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'iv' in data &&
    'encryptedData' in data &&
    typeof (data as EncryptedData).iv === 'string' &&
    typeof (data as EncryptedData).encryptedData === 'string'
  );
}

function hasResults(data: unknown): data is { results: unknown[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as { results: unknown[] }).results)
  );
}

export const transformData = async (
  data: EncryptedData | GifApiResponse | MemeApiResponse | PngData,
  type: "gifs" | "pngs"
): Promise<TransformResult> => {
  try {
    let decryptedData: DecryptedGifData | PngData | GifApiResponse | MemeApiResponse;
    
    if (type === "gifs" && isEncryptedData(data)) {
      const decryptedDataString = decrypt(data);
      decryptedData = JSON.parse(decryptedDataString) as DecryptedGifData;
    } else if (hasResults(data)) {
      decryptedData = data;
    } else {
      throw new Error("Invalid data format: expected 'results' or encryption data");
    }

    const nextValue = 'next' in decryptedData ? decryptedData.next : undefined;

    return {
      nextValue,
      result: decryptedData.results.map((item) => {
        if (type === "gifs") {
          const gifItem = item as GifItem;
          return {
            id: gifItem.id || `gif-${Math.random().toString(36).substring(2, 15)}`,
            title: gifItem.content_description || gifItem.title || "",
            url: gifItem.media_formats?.gif?.url || gifItem.url || "",
            width: gifItem.media_formats?.gif?.width || 300,
            height: gifItem.media_formats?.gif?.height || 300,
          };
        } else {
          return {
            id: `png-${Math.random().toString(36).substring(2, 15)}`,
            title: "",
            url: typeof item === 'string' ? item : '',
            width: 300,
            height: 300,
          };
        }
      }),
    };
  } catch (error) {
    console.error("Error in transformData:", error);
    throw new Error("Failed to decrypt or transform data");
  }
};