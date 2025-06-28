import React, { useState, useRef, useEffect } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  X,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const ImageTextOverlay = ({ imgURI }: { imgURI: string }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [expandedObject, setExpandedObject] = useState<fabric.Object | null>(
    null
  );
  const canvasRef = useRef(null);
  // const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const updateCanvasSize = (
    img: fabric.Image,
    fabricCanvas: fabric.Canvas
  ) => {
    const containerWidth = Math.min(800, window.innerWidth - 32);
    const containerHeight = window.innerHeight - 200;

    let width = img.width;
    let height = img.height;
    let scaleFactor = 1;

    // Calculate scale factor to fit the image within the container
    if (width > containerWidth || height > containerHeight) {
      scaleFactor = Math.min(containerWidth / width, containerHeight / height);
    } else if (width < 400 && height < 400) {
      // If image is smaller than 400x400, scale it up
      scaleFactor = Math.min(400 / width, 400 / height);
    }

    width *= scaleFactor;
    height *= scaleFactor;

    // Set canvas size to match the scaled image size
    // setCanvasSize({ width, height });
    fabricCanvas.setDimensions({ width, height });

    // Scale the image to fit the canvas
    img.scale(scaleFactor);
    fabricCanvas.centerObject(img);
    // @ts-expect-error - FABRIC IS KINDA WEIRD
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error - FABRIC IS KINDA WEIRD
      const fabricCanvas = new fabric.Canvas(canvasRef.current);
      setCanvas(fabricCanvas);

      
      fabric.Image.fromURL(
        imgURI,
        // @ts-expect-error - FABRIC IS KINDA WEIRD
        (img) => {
          updateCanvasSize(img, fabricCanvas);
        },
        { crossOrigin: "anonymous" }
      );

      fabricCanvas.on("selection:created", handleObjectSelected);
      fabricCanvas.on("selection:updated", handleObjectSelected);
      fabricCanvas.on("selection:cleared", () => setSelectedObject(null));

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [imgURI]);

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", () => setSelectedObject(null));
    }
  }, [canvas]);

  // @ts-expect-error - FABRIC IS KINDA WEIRD
  const handleObjectSelected = (e) => {
    setSelectedObject(e.selected[0]);
    setExpandedObject(e.selected[0]);
  };

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText("New Text", {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: 20,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      setSelectedObject(text);
      setExpandedObject(text);
      canvas.renderAll();
    }
  };

  const addImage = () => {
    if (canvas) {
      fabric.Image.fromURL(
        "/api/placeholder/100/100",
        // @ts-expect-error - FABRIC IS KINDA WEIRD
        (img) => {
          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          setSelectedObject(img);
          setExpandedObject(img);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    }
  };

  
  const updateObjectProperty = (property: string, value: fabric.Object) => {
    if (selectedObject) {
      selectedObject.set(property, value);
      canvas?.renderAll();
    }
  };
  const removeObject = () => {
    if (selectedObject && canvas) {
      canvas.remove(selectedObject);
      setSelectedObject(null);
      setExpandedObject(null);
      canvas.renderAll();
    }
  };

  const exportImage = () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "meme.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4 rounded-lg">
      <div className="lg:w-2/3 mb-4 lg:mb-0 lg:mr-4">
        <div className="relative flex justify-center canvas-container bg-white border-2">
          <canvas ref={canvasRef} />
          {canvas && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                onClick={addText}
                className="rounded-full p-2 bg-main hover:bg-main text-white"
              >
                <Type size={24} />
              </Button>
              <Button
                onClick={addImage}
                className="rounded-full p-2 bg-main hover:bg-main text-white"
              >
                <ImageIcon size={24} />
              </Button>
              <Button
                onClick={exportImage}
                className="rounded-full p-2 bg-green-500 hover:bg-green-600 text-black"
              >
                <Download size={24} />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="lg:w-1/3 space-y-4 overflow-y-auto md:max-h-[500px] px-2 py-2">
        {!selectedObject && (
          <Card className="font-semibold text-xl p-3">
            Add or select an object to edit
          </Card>
        )}
        {selectedObject && (
          <div className="bg-white p-4 rounded-lg shadow-light border-2">
            <div className="flex items-center mb-2">
              {/* @ts-expect-error - FABRIC IS KINDA WEIRD */}
              {selectedObject.type === "i-text" && <p>{selectedObject.text}</p>}
              <Button
                size="icon"
                variant="default"
                onClick={() =>
                  setExpandedObject(expandedObject ? null : selectedObject)
                }
              >
                {expandedObject ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="default" onClick={removeObject}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {expandedObject && (
              <div className="grid grid-cols-1 gap-4">
                {selectedObject.type === "i-text" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size
                      </label>
                      <Slider
                        // @ts-expect-error - FABRIC IS KINDA WEIRD
                        value={[selectedObject.fontSize]}
                        onValueChange={(value) =>
                          // @ts-expect-error - FABRIC IS KINDA WEIRD
                          updateObjectProperty("fontSize", value[0])
                        }
                        min={10}
                        max={50}
                        step={1}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fill Color
                      </label>
                      <input
                        type="color"
                        // @ts-expect-error - FABRIC IS KINDA WEIRD
                        value={selectedObject.stroke}
                        onChange={(e) =>
                          // @ts-expect-error - FABRIC IS KINDA WEIRD
                          updateObjectProperty("stroke", e.target.value)
                        }
                        className="w-full h-8 rounded"
                      />
                    </div>
                  </>
                )}
                {selectedObject.type === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opacity
                    </label>
                    <Slider
                      value={[selectedObject.opacity * 100]}
                      onValueChange={(value) =>
                        // @ts-expect-error - FABRIC IS KINDA WEIRD
                        updateObjectProperty("opacity", value[0] / 100)
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation
                  </label>
                  <Slider
                    value={[selectedObject.angle]}
                    onValueChange={(value) =>
                      // @ts-expect-error - FABRIC IS KINDA WEIRD
                      updateObjectProperty("angle", value[0])
                    }
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTextOverlay;
