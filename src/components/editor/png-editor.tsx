import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, ChevronUp, ChevronDown, Type, Image, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useImageEditor } from "@/hooks/use-image-editor";

interface ImageTextOverlayProps {
  imgURI: string;
}

const ImageTextOverlay: React.FC<ImageTextOverlayProps> = ({ imgURI }) => {

  const {
    canvasRef,
    fileInputRef,
    canvas,
    selectedObjectProps,
    expandedObject,
    addText,
    addImage,
    handleImageUpload,
    removeObject,
    exportImage,
    toggleExpanded,
    handleTextColorChange,
    handleStrokeColorChange,
    handleSliderChange,
    handleOpacityChange,
  } = useImageEditor({ imgURI });

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="lg:w-2/3 mb-4 lg:mb-0 lg:mr-4">
        <div className="relative flex justify-center canvas-container bg-secondary-background border-2">
          <canvas ref={canvasRef} />
          {canvas && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                onClick={addText}
                variant="default"
                size="icon"
                className="p-2 bg-primary-foreground hover:text-secondary-background text-foreground shadow-lg"
                title="Add Text"
              >
                <Type size={20} />
              </Button>
              <Button
                onClick={addImage}
                variant="default"
                size="icon"
                className="p-2 bg-primary-foreground hover:text-secondary-background text-foreground shadow-lg"
                title="Add Image"
              >
                <Image size={20} />
              </Button>
              <Button
                onClick={exportImage}
                size="icon"
                className="p-2 bg-primary-foreground hover:text-secondary-background text-foreground shadow-lg"
                title="Download"
              >
                <Download size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-1/3 space-y-4 overflow-y-auto md:max-h-[500px] px-2 py-2">
        {!selectedObjectProps && (
          <Card className="font-semibold text-xl p-4 text-center text-secondary-foreground rounded-none bg-secondary-background border-2">
            Select an any action to start editing
          </Card>
        )}

        {selectedObjectProps && (
          <div className="bg-secondary-background p-4 shadow-md border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {selectedObjectProps.type === "i-text" && (
                  <Type size={16} className="text-primary-foreground" />
                )}
                {selectedObjectProps.type === "image" && (
                  <Image size={16} className="text-primary-foreground" />
                )}
                <span className="font-medium text-sm">
                  {selectedObjectProps.type === "i-text"
                    ? `Text: "${selectedObjectProps.text?.substring(0, 20)}${
                        selectedObjectProps.text &&
                        selectedObjectProps.text.length > 20
                          ? "..."
                          : ""
                      }"`
                    : "Image"}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  className="bg-main text-main-foreground hover:bg-main/90"
                  onClick={toggleExpanded}
                >
                  {expandedObject ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  className="bg-main text-main-foreground hover:bg-main/90"
                  onClick={removeObject}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {expandedObject && (
              <div className="space-y-4">
                {selectedObjectProps.type === "i-text" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {selectedObjectProps.fontSize || 20}px
                      </label>
                      <Slider
                        value={[selectedObjectProps.fontSize || 20]}
                        onValueChange={handleSliderChange("fontSize")}
                        min={8}
                        max={72}
                        step={1}
                        className="mb-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={selectedObjectProps.fill || "#ffffff"}
                        onChange={handleTextColorChange}
                        className="w-full h-10 border-2 shadow-shadow cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outline Color
                      </label>
                      <input
                        type="color"
                        value={selectedObjectProps.stroke || "#000000"}
                        onChange={handleStrokeColorChange}
                        className="w-full h-10 border-2 shadow-shadow cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outline Width: {selectedObjectProps.strokeWidth || 0}px
                      </label>
                      <Slider
                        value={[selectedObjectProps.strokeWidth || 0]}
                        onValueChange={handleSliderChange("strokeWidth")}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                  </>
                )}

                {selectedObjectProps.type === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity:{" "}
                      {Math.round((selectedObjectProps.opacity || 1) * 100)}%
                    </label>
                    <Slider
                      value={[(selectedObjectProps.opacity || 1) * 100]}
                      onValueChange={handleOpacityChange}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {selectedObjectProps.angle || 0}°
                  </label>
                  <Slider
                    value={[selectedObjectProps.angle || 0]}
                    onValueChange={handleSliderChange("angle")}
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