"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  image: {
    url: string;
    medium: string;
    width: number;
    height: number;
  };
}

export default function NewsChannel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Function to start/reset the timer
  const startTimer = useCallback(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000);
  }, [news.length]);

  // Manual navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? news.length - 1 : prevIndex - 1
    );
    startTimer(); // Reset timer
  }, [news.length, startTimer]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    startTimer(); // Reset timer
  }, [news.length, startTimer]);

  // Start timer when news changes
  useEffect(() => {
    if (news.length > 0) {
      startTimer();
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [news, startTimer]);

  if (news.length === 0) {
    return <div>Loading news...</div>;
  }

  const currentNews = news[currentIndex];

  return (
    <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
      {currentNews.image.url && (
        <Image
          src={currentNews.image.url}
          alt={currentNews.title}
          width={currentNews.image.width}
          height={currentNews.image.height}
          className="w-full h-96 object-cover mb-4 rounded"
        />
      )}
      <h2 className="text-2xl font-semibold mb-4 text-white">
        {currentNews.title}
      </h2>
      <p className="text-gray-300 mb-2">
        Published: {new Date(currentNews.pubDate).toLocaleString()}
      </p>
      <a
        href={currentNews.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
      >
        Read more
      </a>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goToPrevious}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
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

        <span className="text-gray-300 text-sm">
          {currentIndex + 1} of {news.length}
        </span>

        <button
          onClick={goToNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
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
  );
}
