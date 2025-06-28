declare module "gifshot" {
  interface GifshotOptions {
    images: string[];
    gifWidth: number;
    gifHeight: number;
    interval?: number;
    progressCallback?: (progress: number) => void;
  }

  interface GifshotResult {
    image: string;
    error?: boolean;
    errorMsg?: string;
  }

  interface Gifshot {
    createGIF(
      options: GifshotOptions,
      callback: (result: GifshotResult) => void
    ): void;
  }

  const gifshot: Gifshot;
  export = gifshot;
}
