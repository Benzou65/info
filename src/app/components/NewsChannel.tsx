"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000); // Change news item every 5 seconds

    return () => clearInterval(ticker);
  }, [news]);

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
    </div>
  );
}
