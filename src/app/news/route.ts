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

const reshapeFeed = (feed: CustomFeed) => {
  return {
    ...feed,
    items: feed.items.map((item) => ({
      ...item,
      image: {
        url: item.imageUrl?.$?.url ?? null,
        medium: item.imageUrl?.$?.medium ?? null,
        width: item.imageUrl?.$?.width ?? null,
        height: item.imageUrl?.$?.height ?? null,
      },
    })),
  };
};

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
