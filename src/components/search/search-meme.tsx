"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDebounce } from "use-debounce";
import MemeGallery from "./meme-gallery";
import MainPaddingWrapper from "../home/main-padding";
import { transformData } from "@/utils/transformData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/auth-context";
import NotLoggedIn from "@/auth/not-logged-in";

// Define types for the component
type MemeType = "gifs" | "pngs";

// Define interfaces for both SearchMeme and MemeGallery components
interface SearchMemeMemeData {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

// This should match the interface in meme-gallery.tsx
interface MemeGalleryMemeData {
  id: string;
  title: string;
  url?: string;
  uri: string;
  width?: number;
  height?: number;
}

interface TransformResult {
  result: SearchMemeMemeData[];
  nextValue: string | undefined;
}

interface GifApiResponse {
  results: any[];
  next?: string;
}

interface MemeApiResponse {
  results: any[];
}

// Adapter function to convert SearchMemeMemeData to MemeGalleryMemeData
const adaptSearchToGalleryData = (
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

// Define MemeSkeleton component
const MemeSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="shadow-shadow animate-pulse bg-white border-2 h-48"
        />
      ))}
    </div>
  );
};

const SearchMeme: React.FC = () => {
  const { user, loading: authLoading, error: authError, signOut } = useAuth();

  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get("q") || "";
  const router = useRouter();
  const pathName = usePathname();

  const [inputTxt, setInputTxt] = useState<string>(queryFromUrl);
  const [debouncedInputTxt] = useDebounce(inputTxt, 300);
  const [memeData, setMemeData] = useState<SearchMemeMemeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [memeType, setMemeType] = useState<MemeType>("gifs");
  const [nextValue, setNextValue] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  
  // Store a stable reference to the current query parameters
  const currentQueryRef = useRef({
    inputTxt: "",
    memeType: memeType as MemeType,
    fetchInProgress: false,
    lastResponseLength: 0
  });

  // Convert memeData to format expected by MemeGallery
  const galleryData = adaptSearchToGalleryData(memeData);

  const fetchMemes = useCallback(
    async (searchQuery: string, type: MemeType, next: string = "", pageNum: number, isLoadMore: boolean = false) => {
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
        
        const transformedData = await transformData(data, type) as TransformResult;
        
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
      } catch (err: any) {
        console.error(`Error fetching ${type}:`, err);
        if (err?.response?.data?.error === "Unauthorized") {
          setError("Session expired. Please log in again.");
        } else {
          setError(`Failed to fetch ${type}. Please try again later.`);
        }
      } finally {
        setIsLoading(false);
        currentQueryRef.current.fetchInProgress = false;
      }
    },
    [user]
  );

  useEffect(() => {
    // Only fetch if user is logged in and not during auth loading
    if (user && !authLoading) {
      const searchQuery = debouncedInputTxt || queryFromUrl || "funny";
      
      // Check if the search query or meme type has changed
      const hasQueryChanged = 
        searchQuery !== currentQueryRef.current.inputTxt || 
        memeType !== currentQueryRef.current.memeType;
      
      if (hasQueryChanged) {
        // This indicates a new search, so we should reset and fetch from the beginning
        fetchMemes(searchQuery, memeType, "", 1, false);
        setPage(1);
      }
    }
  }, [fetchMemes, debouncedInputTxt, queryFromUrl, memeType, pathName, user, authLoading]);

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputTxt)}`);
  };

  const handleLoadMore = () => {
    if (hasMore && user && !isLoading && !currentQueryRef.current.fetchInProgress) {
      // This is explicitly a load more operation
      if (memeType === "gifs") {
        fetchMemes(
          inputTxt || queryFromUrl || "funny",
          memeType,
          nextValue,
          page,
          true // This is a load more operation
        );
      } else {
        const nextPage = page + 1;
        fetchMemes(
          inputTxt || queryFromUrl || "funny", 
          memeType, 
          "", 
          nextPage,
          true // This is a load more operation
        );
        setPage(nextPage);
      }
    }
  };

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <MainPaddingWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </MainPaddingWrapper>
    );
  }

  // Show not logged in component if user is not authenticated
  if (!user) {
    return (
      <MainPaddingWrapper>
        <NotLoggedIn />
      </MainPaddingWrapper>
    );
  }

  return (
    <MainPaddingWrapper>
      <div className="md:max-w-4xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="flex flex-col space-y-4 mb-8 px-4 md:px-8"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search for memes..."
                value={inputTxt}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 "
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            </div>
            <Select value={memeType} onValueChange={handleMemeTypeChange}>
              <SelectTrigger className="w-[120px] md:w-[180px] bg-white">
                <SelectValue placeholder="Meme type" />
              </SelectTrigger>
              <SelectContent className="text-black">
                <SelectItem value="gifs" className="hover:bg-background cursor-pointer">GIFs</SelectItem>
                <SelectItem value="pngs" className="hover:bg-background cursor-pointer">PNGs</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="hidden md:flex w-full md:w-auto md:self-end text-white"
            >
              Search
            </Button>
          </div>
          <Button
            type="submit"
            className="w-full md:w-auto md:self-end md:hidden text-white"
          >
            Search
          </Button>
        </form>

        {(error || authError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || authError}</AlertDescription>
          </Alert>
        )}

        {isLoading && memeData.length === 0 ? (
          <div className="px-4 md:px-8">
            <MemeSkeleton />
          </div>
        ) : memeData.length > 0 ? (
          <>
            <MemeGallery data={galleryData} type={memeType} />
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center py-10 text-gray-500">
            {!error && !authError && <p>No results found. Try a different search term.</p>}
          </div>
        )}
      </div>
    </MainPaddingWrapper>
  );
};

export default SearchMeme;