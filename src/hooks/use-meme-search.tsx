import { useState, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { 
  transformData, 
  GifApiResponse, 
  MemeApiResponse, 
  // TransformResult 
} from "@/utils/transformData";

export type MemeType = "gifs" | "pngs";

export interface SearchMemeMemeData {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

export interface MemeGalleryMemeData {
  id: string;
  title: string;
  url?: string;
  uri: string;
  width?: number;
  height?: number;
}

// Firebase User type interface
interface FirebaseUser {
  getIdToken: () => Promise<string>;
}

// Adapter function to convert SearchMemeMemeData to MemeGalleryMemeData
export const adaptSearchToGalleryData = (
  searchData: SearchMemeMemeData[]
): MemeGalleryMemeData[] => {
  return searchData.map((item) => ({
    id: item.id,
    title: item.title,
    uri: item.url, // Map url to uri for compatibility
    url: item.url,
    width: item.width,
    height: item.height,
  }));
};

export function useMemesSearch(initialQuery = "", initialType = "gifs" as MemeType) {
  const [inputTxt, setInputTxt] = useState<string>(initialQuery);
  const [debouncedInputTxt] = useDebounce(inputTxt, 300);
  const [memeData, setMemeData] = useState<SearchMemeMemeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [memeType, setMemeType] = useState<MemeType>(initialType);
  const [nextValue, setNextValue] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  
  // Store a stable reference to the current query parameters
  const currentQueryRef = useRef({
    inputTxt: "",
    memeType: initialType as MemeType,
    fetchInProgress: false,
    lastResponseLength: 0
  });

  // Convert memeData to format expected by MemeGallery
  const galleryData = adaptSearchToGalleryData(memeData);

  const fetchMemes = useCallback(
    async (searchQuery: string, type: MemeType, next: string = "", pageNum: number, isLoadMore: boolean = false, user: FirebaseUser | null) => {
      if (!searchQuery.trim()) return;
      if (!user) {
        // Don't throw error, just set an error message
        setError("Please log in to search for memes");
        return;
      }
      
      // Prevent multiple simultaneous fetches
      if (currentQueryRef.current.fetchInProgress) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      currentQueryRef.current.fetchInProgress = true;

      try {
        let endpoint: string;
        let data: GifApiResponse | MemeApiResponse;
        
        // Get token only after confirming user exists
        const token = await user.getIdToken();
        
        if (type === "gifs") {
          endpoint = "/api/search-gif";
          const response = await axios.get<GifApiResponse>(
            `${endpoint}?q=${searchQuery}&next=${next}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          data = response.data;
        } else {
          endpoint = "/api/search-meme";
          const response = await axios.get<MemeApiResponse>(
            `${endpoint}?q=${searchQuery}&page=${pageNum}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          data = { results: response.data.results };
        }
        
        const transformedData = await transformData(data, type);
        
        // Update the current query reference before updating state
        currentQueryRef.current.inputTxt = searchQuery;
        currentQueryRef.current.memeType = type;
        currentQueryRef.current.lastResponseLength = transformedData.result.length;
        
        if (isLoadMore) {
          // Important: Create a proper append operation
          setMemeData(prevData => {
            // Make sure we preserve the proper identity of previous data
            const newData = [...prevData];
            
            // Also ensure we don't add duplicates (check by id)
            const existingIds = new Set(newData.map(item => item.id));
            const uniqueNewItems = transformedData.result.filter(
              item => !existingIds.has(item.id)
            );
            
            return [...newData, ...uniqueNewItems];
          });
        } else {
          // For new searches, completely replace data
          setMemeData(transformedData.result);
        }
        
        setNextValue(transformedData.nextValue || "");
        setHasMore(
          type === "gifs"
            ? !!transformedData.nextValue
            : transformedData.result.length > 0
        );
      } catch (err: unknown) {
        console.error(`Error fetching ${type}:`, err);
        if (axios.isAxiosError(err) && err.response?.data?.error === "Unauthorized") {
          setError("Session expired. Please log in again.");
        } else {
          setError(`Failed to fetch ${type}. Please try again later.`);
        }
      } finally {
        setIsLoading(false);
        currentQueryRef.current.fetchInProgress = false;
      }
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTxt(e.target.value);
  };

  const handleMemeTypeChange = (value: MemeType) => {
    if (value !== memeType) {
      setMemeType(value);
      setNextValue("");
      setHasMore(true);
      setPage(1);
    }
  };

  const handleLoadMore = (user: FirebaseUser | null) => {
    if (hasMore && user && !isLoading && !currentQueryRef.current.fetchInProgress) {
      // This is explicitly a load more operation
      if (memeType === "gifs") {
        fetchMemes(
          inputTxt || initialQuery || "funny",
          memeType,
          nextValue,
          page,
          true, // This is a load more operation
          user
        );
      } else {
        const nextPage = page + 1;
        fetchMemes(
          inputTxt || initialQuery || "funny", 
          memeType, 
          "", 
          nextPage,
          true, // This is a load more operation
          user
        );
        setPage(nextPage);
      }
    }
  };

  const performSearch = useCallback((query: string, type: MemeType, user: FirebaseUser | null) => {
    // Check if the search query or meme type has changed
    const hasQueryChanged = 
      query !== currentQueryRef.current.inputTxt || 
      type !== currentQueryRef.current.memeType;
    
    if (hasQueryChanged) {
      // This indicates a new search, so we should reset and fetch from the beginning
      fetchMemes(query, type, "", 1, false, user);
      setPage(1);
    }
  }, [fetchMemes]);

  return {
    inputTxt,
    setInputTxt,
    debouncedInputTxt,
    memeData,
    galleryData,
    isLoading,
    error,
    setError,
    memeType,
    hasMore,
    handleInputChange,
    handleMemeTypeChange,
    handleLoadMore,
    performSearch
  };
}