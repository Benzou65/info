"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  creator?: string;
  image: {
    url: string;
    rssUrl: string;
    medium: string;
    width: number;
    height: number;
  };
  imageCredit?: string;
}

// Custom Image component with fallback handling
function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
} & React.ComponentProps<typeof Image>) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return <Image {...props} src={imgSrc} alt={alt} onError={handleError} />;
}

export default function NewsChannel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(5000);

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch("/news");
      const data = await response.json();
      setNews(data.items);
      console.log(data);
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Timer effect - handles starting, pausing, and resuming
  useEffect(() => {
    if (news.length === 0) return;

    if (!isHovered) {
      // Start or resume timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
        remainingTimeRef.current = 5000; // Reset for next slide
      }, remainingTimeRef.current);
    } else {
      // Pause timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;

        // Calculate remaining time
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(
          0,
          remainingTimeRef.current - elapsed
        );
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [news.length, isHovered, currentIndex]);

  // Handle mouse enter (pause timer)
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Handle mouse leave (resume timer)
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Manual navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? news.length - 1 : prevIndex - 1
    );
    remainingTimeRef.current = 5000; // Reset remaining time
  }, [news.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    remainingTimeRef.current = 5000; // Reset remaining time
  }, [news.length]);

  if (news.length === 0) {
    return <div>Loading news...</div>;
  }

  const currentNews = news[currentIndex];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onClick={() => {
        console.log("currentNews.image.url", currentNews.image.url);
        console.log("currentNews.image.rssUrl", currentNews.image.rssUrl);
      }}
    >
      {/* Background Image - covers entire viewport */}
      {currentNews.image.url && (
        <ImageWithFallback
          src={currentNews.image.url}
          fallbackSrc={currentNews.image.rssUrl}
          alt={currentNews.title}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Content overlay - bottom of screen */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            {currentNews.title}
          </h2>
          <p className="text-gray-200 mb-2">
            Published:{" "}
            {new Date(currentNews.pubDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(currentNews.pubDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          {(currentNews.creator || currentNews.imageCredit) && (
            <div className="flex items-center gap-4 mb-2 text-sm">
              {currentNews.creator && (
                <span className="text-gray-300">By: {currentNews.creator}</span>
              )}
              {currentNews.imageCredit && (
                <span className="text-gray-300">
                  📷 {currentNews.imageCredit}
                </span>
              )}
            </div>
          )}
          <a
            href={currentNews.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-100 hover:underline"
          >
            Read more
          </a>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={goToPrevious}
              className="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <span className="text-white text-sm bg-black bg-opacity-30 px-3 py-1 rounded backdrop-blur-sm">
              {currentIndex + 1} of {news.length}
            </span>

            <button
              onClick={goToNext}
              className="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
            >
              Next
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
