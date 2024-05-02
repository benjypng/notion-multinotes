import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";

const extractTextFromBlock = (block: any): string => {
  let text = "";

  if (block.type === "paragraph") {
    text +=
      block.paragraph.rich_text.map((t: any) => t.plain_text).join("") + "\n";
  } else if (block.type === "bulleted_list_item") {
    text += block.bulleted_list_item.rich_text
      .map((t: any) => "- " + t.plain_text + " \n")
      .join("");
  }

  return text;
};

const fetchAllBlocks = async (
  blockId: string,
  startCursor?: string,
): Promise<any> => {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const response = await notion.blocks.children.list({
    block_id: blockId,
    start_cursor: startCursor,
    page_size: 100,
  });

  const blocks = response.results;

  if (response.has_more && response.next_cursor) {
    const moreBlocks = await fetchAllBlocks(blockId, response.next_cursor);
    return [...blocks, ...moreBlocks];
  } else {
    return blocks;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const blocks = await fetchAllBlocks(req.query.id as string);
    const allTexts: string[] = blocks
      .map((block: any) => extractTextFromBlock(block))
      .filter((text: string) => text.length > 0);

    res.status(200).json({ message: allTexts.join("\n") });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
