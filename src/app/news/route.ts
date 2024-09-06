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

export async function GET() {
  try {
    const feed = await parser.parseURL(
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
    );

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

    const reshapedFeed = reshapeFeed(feed);

    try {
      console.log(reshapedFeed);
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json(reshapedFeed);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
