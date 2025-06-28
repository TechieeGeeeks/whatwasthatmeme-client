declare module "gif-frames" {
  interface GifFramesOptions {
    url: string;
    frames: "all" | number;
    outputType: "canvas" | "pixels";
  }

  interface FrameData {
    frameInfo: {
      width: number;
      height: number;
      delay?: number;
    };
    getImage: () => HTMLImageElement;
  }

  function gifFrames(options: GifFramesOptions): Promise<FrameData[]>;

  export = gifFrames;
}
