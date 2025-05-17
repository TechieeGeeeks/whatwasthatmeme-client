"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import MemeCard, { MemeGalleryMemeData } from "./meme-card";

interface MemeGalleryProps {
  data: MemeGalleryMemeData[];
  type: "gifs" | "pngs";
  prevDataLength?: number; // Track previous data length to identify new items
}

interface ColumnItem {
  meme: MemeGalleryMemeData;
  index: number;
  isNew: boolean;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({
  data,
  type,
  prevDataLength = 0
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const prevDataLengthRef = useRef<number>(prevDataLength);
  
  // Create refs for each column
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);
  const column3Ref = useRef<HTMLDivElement>(null);
  
  // Check if we're appending new items
  const isAppending = data.length > prevDataLengthRef.current;

  // Distribute items across columns
  useEffect(() => {
    if (isAppending && galleryRef.current) {
      // Only animate new items
      const newItems = galleryRef.current.querySelectorAll('.meme-item-new');
      newItems.forEach(item => {
        item.classList.add('animate-fadeIn');
        
        // Remove animation class after it completes
        setTimeout(() => {
          item.classList.remove('animate-fadeIn');
          item.classList.remove('meme-item-new');
        }, 500);
      });
      
      // Update the previous length
      prevDataLengthRef.current = data.length;
    }
  }, [data.length, isAppending]);

  // Distribute data across the columns to maintain balance
  const distributeItems = (): ColumnItem[][] => {
    const columns: ColumnItem[][] = [[], [], []]; // Max 3 columns
    
    // Existing items (preserve their positions)
    const existingItems = data.slice(0, prevDataLength);
    for (let i = 0; i < existingItems.length; i++) {
      columns[i % columns.length].push({
        meme: existingItems[i],
        index: i,
        isNew: false
      });
    }
    
    // New items (distribute to columns)
    const newItems = data.slice(prevDataLength);
    for (let i = 0; i < newItems.length; i++) {
      columns[i % columns.length].push({
        meme: newItems[i], 
        index: i + prevDataLength,
        isNew: true
      });
    }
    
    return columns;
  };
  
  const columns = distributeItems();

  return (
    <div className="px-4 md:px-8" ref={galleryRef}>
    
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>

      <div className="flex flex-wrap -mx-2">
        {/* Column 1 */}
        <div className="w-1/2 md:w-1/3 px-2" ref={column1Ref}>
          {columns[0].map(({ meme, index, isNew }) => (
            <div 
              key={`${meme.id}-${index}`} 
              className={`mb-4 ${isNew ? 'meme-item-new' : ''}`}
            >
              <MemeCard memeId={meme} index={index} type={type} />
            </div>
          ))}
        </div>
        
        {/* Column 2 */}
        <div className="w-1/2 md:w-1/3 px-2" ref={column2Ref}>
          {columns[1].map(({ meme, index, isNew }) => (
            <div 
              key={`${meme.id}-${index}`} 
              className={`mb-4 ${isNew ? 'meme-item-new' : ''}`}
            >
              <MemeCard memeId={meme} index={index} type={type} />
            </div>
          ))}
        </div>
        
        {/* Column 3 */}
        <div className="hidden md:block md:w-1/3 px-2" ref={column3Ref}>
          {columns[2].map(({ meme, index, isNew }) => (
            <div 
              key={`${meme.id}-${index}`} 
              className={`mb-4 ${isNew ? 'meme-item-new' : ''}`}
            >
              <MemeCard memeId={meme} index={index} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemeGallery;