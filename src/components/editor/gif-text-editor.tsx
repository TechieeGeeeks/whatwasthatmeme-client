import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  X,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Download,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MemeEditorSkeleton from "./meme-editor-skeleton";
import { useGifTextOverlay } from "@/hooks/use-gif-text-overlay";

const GifTextOverlay = ({
  gifURI = "https://media.tenor.com/hmDMrE1yMAkAAAAC/when-the-coding-when-the.gif",
}: {
  gifURI?: string;
}) => {
  const {
    textBoxes,
    canvasRef,
    canvasSize,
    expandedBox,
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
  } = useGifTextOverlay(gifURI);

  if (isLoading) {
    return <MemeEditorSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="mt-2">Error details have been logged to the console.</p>
          <p className="mt-2">Please check the GIF URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4">
      <div className="lg:w-2/3 mb-4 lg:mb-0 lg:mr-4">
        <div className="relative flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={handleMouseUp}
            className="border-2 shadow-dark touch-none"
          />
          <canvas ref={exportCanvasRef} style={{ display: "none" }} />
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <Button
              onClick={addTextBox}
              className="p-2 bg-secondary-background border-2 border-foreground shadow-shadow hover:bg-main text-foreground"
            >
              <PlusCircle size={24} />
            </Button>
            <Button
              onClick={exportGif}
              className="p-2 bg-foreground border-2 border-foreground shadow-shadow hover:bg-main text-secondary-background hover:text-foreground"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Download size={24} />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="lg:w-1/3 space-y-4 overflow-y-auto md:max-h-[500px] px-2 py-2">
        {textBoxes.length === 0 && (
          <Card className="font-semibold text-xl p-3 rounded-none bg-secondary-background">
            Click on Add button to add text&lsquo;s
          </Card>
        )}

        {textBoxes.map((box) => (
          <div
            key={box.id}
            className="bg-secondary-background p-4 shadow-light border-2"
          >
            <div className="flex items-center mb-2">
              <Input
                type="text"
                value={box.text}
                onChange={(e) =>
                  handleTextChange(box.id, "text", e.target.value)
                }
                className="mr-2 flex-grow"
              />
              <Button
                size="icon"
                variant="neutral"
                onClick={() =>
                  setExpandedBox(expandedBox === box.id ? null : box.id)
                }
              >
                {expandedBox === box.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                className="bg-main text-main-foreground hover:bg-main/90"
                onClick={() => removeTextBox(box.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {expandedBox === box.id && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <Slider
                    value={[box.fontSize]}
                    onValueChange={(value) =>
                      handleTextChange(box.id, "fontSize", value[0])
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
                    value={box.color}
                    onChange={(e) =>
                      handleTextChange(box.id, "color", e.target.value)
                    }
                    className="w-full h-8 shadow-shadow border-2 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stroke Width
                  </label>
                  <Slider
                    value={[box.strokeWidth]}
                    onValueChange={(value) =>
                      handleTextChange(box.id, "strokeWidth", value[0])
                    }
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stroke Color
                  </label>
                  <input
                    type="color"
                    value={box.strokeColor}
                    onChange={(e) =>
                      handleTextChange(box.id, "strokeColor", e.target.value)
                    }
                    className="w-full h-8"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GifTextOverlay;