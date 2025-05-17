"use client";
import React, { useEffect, useState, useCallback } from "react";
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
          className="bg-gray-200 animate-pulse rounded-lg h-40"
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

  // Convert memeData to format expected by MemeGallery
  const galleryData = adaptSearchToGalleryData(memeData);

  const fetchMemes = useCallback(
    async (searchQuery: string, type: MemeType, next: string = "", pageNum: number) => {
      if (!searchQuery.trim()) return;
      if (!user) {
        // Don't throw error, just set an error message
        setError("Please log in to search for memes");
        return;
      }
      
      setIsLoading(true);
      setError(null);

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
        
        if (next || pageNum > 1) {
          setMemeData((prevData) => [...prevData, ...transformedData.result]);
        } else {
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
      }
    },
    [user]
  );

  useEffect(() => {
    // Only fetch if user is logged in and not during auth loading
    if (user && !authLoading) {
      const searchQuery = debouncedInputTxt || queryFromUrl || "funny";
      fetchMemes(searchQuery, memeType, "", 1);
      setPage(1);
    }
  }, [fetchMemes, debouncedInputTxt, queryFromUrl, memeType, pathName, user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTxt(e.target.value);
  };

  const handleMemeTypeChange = (value: MemeType) => {
    setMemeType(value);
    setNextValue("");
    setHasMore(true);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputTxt)}`);
  };

  const handleLoadMore = () => {
    if (hasMore && user) {
      if (memeType === "gifs") {
        fetchMemes(
          inputTxt || queryFromUrl || "funny",
          memeType,
          nextValue,
          page
        );
      } else {
        const nextPage = page + 1;
        fetchMemes(inputTxt || queryFromUrl || "funny", memeType, "", nextPage);
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            </div>
            <Select value={memeType} onValueChange={handleMemeTypeChange}>
              <SelectTrigger className="w-[120px] md:w-[180px]">
                <SelectValue placeholder="Meme type" />
              </SelectTrigger>
              <SelectContent className="text-white">
                <SelectItem value="gifs">GIFs</SelectItem>
                <SelectItem value="pngs">PNGs</SelectItem>
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

        {isLoading ? (
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