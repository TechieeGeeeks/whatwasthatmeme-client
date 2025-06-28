import { useState, useRef, useEffect } from "react";
import gifFrames from "gif-frames";
import gifshot from "gifshot";

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

interface Frame {
  frameInfo: {
    width: number;
    height: number;
    delay?: number;
  };
  getImage: () => HTMLImageElement;
}

interface GifshotResult {
  image: string;
  error?: boolean;
  errorMsg?: string;
}

export const useGifTextOverlay = (gifURI?: string) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<TextBox | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [gif, setGif] = useState<HTMLImageElement | null>(null);
  const [expandedBox, setExpandedBox] = useState<number | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadGif = async () => {
      setIsLoading(true);
      setError(null);

      if (!gifURI) {
        console.error("gifURI is undefined");
        setError("No image URL provided. Please check the gifURI prop.");
        setIsLoading(false);
        return;
      }

      try {
        const frameData = await gifFrames({
          url: gifURI,
          frames: "all",
          outputType: "canvas",
        });

        setFrames(frameData);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setGif(img);
          updateCanvasSize(img);
          setIsLoading(false);
        };
        img.onerror = (e) => {
          console.error("Error loading GIF image:", e);
          throw new Error("Failed to load GIF image");
        };
        img.src = gifURI;
      } catch (error) {
        console.error("Error in loadGif:", error);

        try {
          const response = await fetch(gifURI);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          const img = new Image();
          img.onload = () => {
            setGif(img);
            setFrames([
              {
                frameInfo: { width: img.width, height: img.height },
                getImage: () => img,
              },
            ]);
            updateCanvasSize(img);
            setIsLoading(false);
          };
          img.onerror = (e) => {
            console.error("Error loading as regular image:", e);
            throw new Error(
              `Failed to load image: ${
                e instanceof Error ? e.message : "Unknown error"
              }`
            );
          };
          img.src = URL.createObjectURL(blob);
        } catch (imgError) {
          console.error("Error loading as regular image:", imgError);
          setError(
            `Failed to load image. ${
              imgError instanceof Error ? imgError.message : "Unknown error"
            }`
          );
          setIsLoading(false);
        }
      }
    };

    loadGif();
  }, [gifURI]);

  useEffect(() => {
    const handleResize = () => updateCanvasSize(gif);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gif]);

  useEffect(() => {
    if (canvasSize.width && canvasSize.height && gif) {
      drawCanvas();
    }
  }, [canvasSize, gif, textBoxes]);

  const updateCanvasSize = (img: HTMLImageElement | null) => {
    if (!img) return;

    const maxWidth = Math.min(800, window.innerWidth - 32);
    const maxHeight = window.innerHeight - 200;

    let width, height;

    if (img.width / img.height > maxWidth / maxHeight) {
      width = maxWidth;
      height = (maxWidth * img.height) / img.width;
    } else {
      height = maxHeight;
      width = (maxHeight * img.width) / img.height;
    }

    setCanvasSize({ width, height });
  };

  const wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i++) {
      context.strokeText(lines[i], x, y + i * lineHeight);
      context.fillText(lines[i], x, y + i * lineHeight);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gif) {
      ctx.drawImage(gif, 0, 0, canvas.width, canvas.height);
    } else {
      console.error("No GIF loaded to draw on canvas");
    }

    textBoxes.forEach((box) => {
      ctx.font = `${box.fontSize}px Arial`;
      ctx.fillStyle = box.color;
      ctx.strokeStyle = box.strokeColor;
      ctx.lineWidth = box.strokeWidth;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = canvas.width * 0.8;
      const lineHeight = box.fontSize * 1.2;
      wrapText(ctx, box.text, box.x, box.y, maxWidth, lineHeight);
    });
  };

  const addTextBox = () => {
    const newBox: TextBox = {
      id: Date.now(),
      text: "New Text",
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      fontSize: 20,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
    };
    setTextBoxes([...textBoxes, newBox]);
    setExpandedBox(newBox.id);
  };

  const handleTextChange = (
    id: number,
    field: keyof TextBox,
    value: string | number
  ) => {
    setTextBoxes(
      textBoxes.map((box) => (box.id === id ? { ...box, [field]: value } : box))
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement> | MouseEvent
  ) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setSelectedBox(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const clickedBox = textBoxes.find(
      (box) => Math.abs(box.x - x) < 50 && Math.abs(box.y - y) < 20
    );

    setSelectedBox(clickedBox || null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (selectedBox) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setTextBoxes(
        textBoxes.map((box) =>
          box.id === selectedBox.id ? { ...box, x, y } : box
        )
      );
    }
  };

  const handleTouchEnd = () => {
    setSelectedBox(null);
  };

  const removeTextBox = (id: number) => {
    setTextBoxes(textBoxes.filter((box) => box.id !== id));
    if (expandedBox === id) setExpandedBox(null);
  };

  const scalePosition = (
    pos: number,
    originalSize: number,
    newSize: number
  ) => {
    return (pos / originalSize) * newSize;
  };

  const exportGif = async () => {
    setIsProcessing(true);
    const displayCanvas = canvasRef.current;
    const exportCanvas = exportCanvasRef.current;

    if (!displayCanvas || !exportCanvas) {
      setIsProcessing(false);
      return;
    }

    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) {
      setIsProcessing(false);
      return;
    }

    const newFrames = await Promise.all(
      frames.map(async (frame) => {
        exportCanvas.width = frame.frameInfo.width;
        exportCanvas.height = frame.frameInfo.height;
        exportCtx.drawImage(frame.getImage(), 0, 0);

        textBoxes.forEach((box) => {
          exportCtx.font = `${box.fontSize}px Arial`;
          exportCtx.fillStyle = box.color;
          exportCtx.strokeStyle = box.strokeColor;
          exportCtx.lineWidth = box.strokeWidth;
          exportCtx.textAlign = "center";
          exportCtx.textBaseline = "middle";

          const scaledX = scalePosition(
            box.x,
            displayCanvas.width,
            exportCanvas.width
          );
          const scaledY = scalePosition(
            box.y,
            displayCanvas.height,
            exportCanvas.height
          );
          const scaledFontSize =
            (box.fontSize / displayCanvas.width) * exportCanvas.width;

          const maxWidth = exportCanvas.width * 0.8;
          const lineHeight = scaledFontSize * 1.2;
          wrapText(exportCtx, box.text, scaledX, scaledY, maxWidth, lineHeight);
        });

        return exportCanvas.toDataURL("image/png");
      })
    );

    try {
      const result = await new Promise<GifshotResult>((resolve, reject) => {
        gifshot.createGIF(
          {
            images: newFrames,
            gifWidth: frames[0].frameInfo.width,
            gifHeight: frames[0].frameInfo.height,
            interval: frames[0].frameInfo.delay
              ? frames[0].frameInfo.delay / 100
              : 0.1,
          },
          (obj: GifshotResult) => {
            if (!obj.error) {
              resolve(obj);
            } else {
              reject(new Error(obj.errorMsg));
            }
          }
        );
      });

      const link = document.createElement("a");
      link.href = result.image;
      link.download = "edited_gif.gif";
      link.click();
    } catch (error) {
      console.error("Error creating GIF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    textBoxes,
    selectedBox,
    canvasRef,
    canvasSize,
    gif,
    expandedBox,
    frames,
    isLoading,
    isProcessing,
    error,
    exportCanvasRef,
    setExpandedBox,
    addTextBox,
    handleTextChange,
    handleTouchStart,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
    removeTextBox,
    exportGif,
  };
};