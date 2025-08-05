import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface CustomItem extends Parser.Item {
  imageUrl?: {
    $: {
      url: string;
      medium: string;
      width: string;
      height: string;
    };
  };
  imageCredit?: string;
}

interface CustomFeed extends Parser.Output<CustomItem> {
  items: CustomItem[];
}

const parser: Parser<CustomFeed> = new Parser({
  customFields: {
    item: [
      ["media:content", "imageUrl"],
      ["media:credit", "imageCredit"],
    ],
  },
});

/**
 * Modifies image URLs to optimize them for web display by standardizing size parameters
 * and adding quality/format optimizations.
 *
 * This function processes New York Times image URLs to:
 * 1. Standardize image sizes to "threeByTwoMediumAt2X" format
 * 2. Remove version numbers (e.g., -v2, -v3)
 * 3. Add quality and format parameters (quality=75&auto=webp)
 *
 * @param url - The original image URL to modify
 * @returns The modified URL with standardized size and optimization parameters, or the original URL if no modifications are needed
 */
const modifyImageUrl = (url: string): string => {
  if (!url || !url.includes(".jpg")) {
    return url;
  }

  // Split the URL by '/' to get the filename
  const urlParts = url.split("/");
  const filename = urlParts[urlParts.length - 1];

  // Find the size identifier patterns that come before the extension
  const sizePatterns = [
    "-mediumSquareAt3X",
    "-threeByTwoMediumAt2X",
    "-jumbo",
    "-superJumbo",
  ];

  let modifiedFilename = filename;

  // Try to find and replace any size pattern
  for (const pattern of sizePatterns) {
    if (filename.includes(pattern)) {
      // Replace the size pattern with "threeByTwoMediumAt2X"
      modifiedFilename = filename.replace(pattern, "-threeByTwoMediumAt2X");
      break;
    }
  }

  // If no size pattern was found, try to find the last dash before the extension
  if (modifiedFilename === filename) {
    const dotIndex = filename.lastIndexOf(".");
    const lastDashIndex = filename.lastIndexOf("-");

    if (lastDashIndex !== -1 && dotIndex > lastDashIndex) {
      // Check if there's a version number after the last dash (like -v2)
      const afterLastDash = filename.substring(lastDashIndex + 1, dotIndex);
      if (afterLastDash.match(/^v\d+$/)) {
        // If it's a version number, find the previous dash
        const beforeVersion = filename.substring(0, lastDashIndex);
        const secondLastDashIndex = beforeVersion.lastIndexOf("-");

        if (secondLastDashIndex !== -1) {
          const baseName = filename.substring(0, secondLastDashIndex);
          const extension = filename.substring(dotIndex);
          modifiedFilename = `${baseName}-threeByTwoMediumAt2X${extension}`;
        }
      } else {
        // Regular case: replace the last word before extension
        const baseName = filename.substring(0, lastDashIndex);
        const extension = filename.substring(dotIndex);
        modifiedFilename = `${baseName}-threeByTwoMediumAt2X${extension}`;
      }
    }
  }

  // Remove version numbers like -v2, -v3, etc. from the modified filename
  modifiedFilename = modifiedFilename.replace(/-v\d+\.jpg/, ".jpg");

  // Add query parameters
  if (modifiedFilename.includes("?")) {
    // If there are already query parameters, add to them
    modifiedFilename = `${modifiedFilename}&quality=75&auto=webp`;
  } else {
    modifiedFilename = `${modifiedFilename}?quality=75&auto=webp`;
  }

  // Replace the filename in the URL
  urlParts[urlParts.length - 1] = modifiedFilename;
  return urlParts.join("/");
};

const reshapeFeed = (feed: CustomFeed) => {
  return {
    ...feed,
    items: feed.items
      .map((item) => ({
        ...item,
        image: {
          url: modifyImageUrl(item.imageUrl?.$?.url ?? "") || null,
          rssUrl: item.imageUrl?.$?.url ?? null,
          medium: item.imageUrl?.$?.medium ?? null,
          width: item.imageUrl?.$?.width ?? null,
          height: item.imageUrl?.$?.height ?? null,
        },
      }))
      .filter((item) => item.image.rssUrl !== null),
  };
};

export const dynamic = "force-dynamic";

export const revalidate = 1800; // 30 minutes

export async function GET() {
  try {
    const feed = await parser.parseURL(
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
    );

    const reshapedFeed = reshapeFeed(feed);

    return NextResponse.json(reshapedFeed);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message, error: error },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred", error: error },
      { status: 500 }
    );
  }
}
