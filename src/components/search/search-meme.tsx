"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MemeGallery from "./meme-gallery";
import MainPaddingWrapper from "../home/main-padding";
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
import { useMemesSearch, MemeType } from "@/hooks/use-meme-search";
import { MemeSkeleton } from "@/components/skeletons/meme-skeleton";

const SearchMeme: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const router = useRouter();
  const pathName = usePathname();

  const {
    inputTxt,
    memeData,
    galleryData,
    isLoading,
    error,
    memeType,
    hasMore,
    handleInputChange,
    handleMemeTypeChange,
    handleLoadMore,
    performSearch,
    debouncedInputTxt,
  } = useMemesSearch(queryFromUrl);

  useEffect(() => {
    // Only fetch if user is logged in and not during auth loading
    if (user && !authLoading) {
      const searchQuery = debouncedInputTxt || queryFromUrl || "funny";
      performSearch(searchQuery, memeType, user);
    }
  }, [
    performSearch,
    debouncedInputTxt,
    queryFromUrl,
    memeType,
    pathName,
    user,
    authLoading,
  ]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputTxt)}`);
  };

  const loadMoreHandler = () => {
    if (user) {
      handleLoadMore(user);
    }
  };

  if (authLoading) {
    return (
      <MainPaddingWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </MainPaddingWrapper>
    );
  }

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
            <Select
              value={memeType}
              onValueChange={handleMemeTypeChange as (value: string) => void}
            >
              <SelectTrigger className="w-[120px] md:w-[180px] bg-white">
                <SelectValue placeholder="Meme type" />
              </SelectTrigger>
              <SelectContent className="text-black">
                <SelectItem
                  value="gifs"
                  className="hover:bg-background cursor-pointer"
                >
                  GIFs
                </SelectItem>
                <SelectItem
                  value="pngs"
                  className="hover:bg-background cursor-pointer"
                >
                  PNGs
                </SelectItem>
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
                  onClick={loadMoreHandler}
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
            {!error && !authError && (
              <p>No results found. Try a different search term.</p>
            )}
          </div>
        )}
      </div>
    </MainPaddingWrapper>
  );
};

export default SearchMeme;
