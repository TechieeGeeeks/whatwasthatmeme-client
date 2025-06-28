import { useState, useRef, useEffect } from "react";
import { fabric, FabricSelectionEvent } from "fabric";

interface ObjectProperties {
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  opacity?: number;
  angle?: number;
  type?: string;
}

interface UseImageEditorProps {
  imgURI: string;
}

interface UseImageEditorReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  canvas: fabric.Canvas | null;
  selectedObjectProps: ObjectProperties | null;
  expandedObject: ObjectProperties | null;

  addText: () => void;
  addImage: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateObjectProperty: (property: string, value: unknown) => void;
  removeObject: () => void;
  exportImage: () => void;
  toggleExpanded: () => void;

  handleTextColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStrokeColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (property: string) => (value: number[]) => void;
  handleOpacityChange: (value: number[]) => void;
}

export const useImageEditor = ({
  imgURI,
}: UseImageEditorProps): UseImageEditorReturn => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjectProps, setSelectedObjectProps] =
    useState<ObjectProperties | null>(null);
  const [expandedObject, setExpandedObject] = useState<ObjectProperties | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateCanvasSize = (
    img: fabric.Image,
    fabricCanvas: fabric.Canvas
  ): void => {
    const containerWidth = Math.min(800, window.innerWidth - 32);
    const containerHeight = window.innerHeight - 200;

    let width = img.width || 0;
    let height = img.height || 0;
    let scaleFactor = 1;

    if (width > containerWidth || height > containerHeight) {
      scaleFactor = Math.min(containerWidth / width, containerHeight / height);
    } else if (width < 400 && height < 400) {
      scaleFactor = Math.min(400 / width, 400 / height);
    }

    width *= scaleFactor;
    height *= scaleFactor;

    fabricCanvas.setDimensions({ width, height });

    img.scale(scaleFactor);
    fabricCanvas.centerObject(img);

    fabricCanvas.setBackgroundImage(
      img,
      fabricCanvas.renderAll.bind(fabricCanvas),
      {
        scaleX: scaleFactor,
        scaleY: scaleFactor,
      }
    );

    fabricCanvas.renderAll();
  };

  const getObjectProperties = (obj: fabric.IObject): ObjectProperties => {
    return {
      fontSize: obj.fontSize,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      text: obj.text,
      opacity: obj.opacity,
      angle: obj.angle,
      type: obj.type,
    };
  };

  const handleObjectSelected = (e: FabricSelectionEvent): void => {
    const selected = e.selected[0];
    const props = getObjectProperties(selected);
    setSelectedObjectProps(props);
    setExpandedObject(props);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current);
      setCanvas(fabricCanvas);

      fabric.Image.fromURL(
        imgURI,
        (img: fabric.Image) => {
          updateCanvasSize(img, fabricCanvas);
        },
        { crossOrigin: "anonymous" }
      );

      fabricCanvas.on("selection:created", handleObjectSelected);
      fabricCanvas.on("selection:updated", handleObjectSelected);
      fabricCanvas.on("selection:cleared", () => {
        setSelectedObjectProps(null);
        setExpandedObject(null);
      });

      fabricCanvas.on("object:modified", () => {
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj) {
          const props = getObjectProperties(activeObj);
          setSelectedObjectProps(props);
          setExpandedObject(props);
        }
      });

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [imgURI]);

  const addText = (): void => {
    if (canvas) {
      const text = new fabric.IText("New Text", {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: 24,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        textAlign: "center",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      const props = getObjectProperties(text);
      setSelectedObjectProps(props);
      setExpandedObject(props);
      canvas.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        fabric.Image.fromURL(
          imgUrl,
          (img: fabric.Image) => {
            const maxSize = 200;
            const scale = Math.min(
              maxSize / (img.width || 1),
              maxSize / (img.height || 1)
            );

            img.set({
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              scaleX: scale,
              scaleY: scale,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            const props = getObjectProperties(img);
            setSelectedObjectProps(props);
            setExpandedObject(props);
            canvas.renderAll();
          },
          { crossOrigin: "anonymous" }
        );
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const addImage = (): void => {
    fileInputRef.current?.click();
  };

  const updateObjectProperty = (property: string, value: unknown): void => {
    if (canvas && selectedObjectProps) {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        activeObj.set(property, value);
        canvas.renderAll();
        const updatedProps = { ...selectedObjectProps, [property]: value };
        setSelectedObjectProps(updatedProps);
        setExpandedObject(updatedProps);
      }
    }
  };

  const removeObject = (): void => {
    if (canvas && selectedObjectProps) {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        canvas.remove(activeObj);
        setSelectedObjectProps(null);
        setExpandedObject(null);
        canvas.renderAll();
      }
    }
  };

  const exportImage = (): void => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({ format: "png", quality: 1.0 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "edited-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleExpanded = (): void => {
    setExpandedObject(expandedObject ? null : selectedObjectProps);
  };

  const handleTextColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateObjectProperty("fill", e.target.value);
  };

  const handleStrokeColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateObjectProperty("stroke", e.target.value);
  };

  const handleSliderChange =
    (property: string) =>
    (value: number[]): void => {
      updateObjectProperty(property, value[0]);
    };

  const handleOpacityChange = (value: number[]): void => {
    updateObjectProperty("opacity", value[0] / 100);
  };

  return {
    canvasRef,
    fileInputRef,

    canvas,
    selectedObjectProps,
    expandedObject,

    addText,
    addImage,
    handleImageUpload,
    updateObjectProperty,
    removeObject,
    exportImage,
    toggleExpanded,

    handleTextColorChange,
    handleStrokeColorChange,
    handleSliderChange,
    handleOpacityChange,
  };
};
