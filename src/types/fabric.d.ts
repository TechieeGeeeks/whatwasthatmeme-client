declare module "fabric" {
  export interface IObject {
    set(property: string, value: unknown): IObject;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    opacity?: number;
    angle?: number;
    type?: string;
    width?: number;
    height?: number;
  }

  export interface FabricSelectionEvent {
    selected: IObject[];
  }

  export namespace fabric {
    export interface IObject {
      set(property: string, value: unknown): IObject;
      fontSize?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      text?: string;
      opacity?: number;
      angle?: number;
      type?: string;
      width?: number;
      height?: number;
    }

    export class Canvas {
      constructor(element: HTMLCanvasElement);
      setDimensions(dimensions: { width: number; height: number }): void;
      centerObject(obj: IObject): void;
      setBackgroundImage(
        img: Image,
        callback: () => void,
        options?: unknown
      ): void;
      renderAll(): void;
      add(obj: IObject): void;
      remove(obj: IObject): void;
      setActiveObject(obj: IObject): void;
      getActiveObject(): IObject | null;
      getActiveObjects(): IObject[];
      getWidth(): number;
      getHeight(): number;
      toDataURL(options: { format: string; quality: number }): string;
      on(
        event: "selection:created" | "selection:updated",
        handler: (e: FabricSelectionEvent) => void
      ): void;
      on(event: "selection:cleared", handler: () => void): void;
      on(event: string, handler: (e: unknown) => void): void;
      dispose(): void;
    }

    export class Image implements IObject {
      constructor(element?: HTMLImageElement);
      static fromURL(
        url: string,
        callback: (img: Image) => void,
        options?: unknown
      ): void;
      width?: number;
      height?: number;
      scale(factor: number): void;
      set(property: string, value: unknown): Image;
      set(options: unknown): Image;
      fontSize?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      text?: string;
      opacity?: number;
      angle?: number;
      type?: string;
    }

    export class IText implements IObject {
      constructor(text: string, options?: unknown);
      set(property: string, value: unknown): IText;
      fontSize?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      text?: string;
      opacity?: number;
      angle?: number;
      type?: string;
      width?: number;
      height?: number;
    }

    export class Object implements IObject {
      set(property: string, value: unknown): Object;
      fontSize?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      text?: string;
      opacity?: number;
      angle?: number;
      type?: string;
      width?: number;
      height?: number;
    }
  }

  export const fabric: typeof fabric;
}
