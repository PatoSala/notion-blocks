import { Block } from "../interfaces/Block.interface";

/**
 * @param block Block to update
 * @param updatedData Updated block data
 * @returns Updated block
 */

// Temporary: Must find a dynic way to find out this types in case a custom text based block is also added.
export const textBlockTypes = ["text", "header", "sub_header", "sub_sub_header"];

export function updateBlock(block: Block, updatedData: Partial<Block>) {
    const updatedBlock = { ...block, ...updatedData };
    return updatedBlock;
}

/** Inserts a new block ID into the content array. If no prevBlockId or nextBlockId is provided, it will be appended to the end. */
export function insertBlockIdIntoContent(
  contentArray: string[],
  newBlockId: string,
  options: { prevBlockId?: string; nextBlockId?: string }
) {

  if (options?.prevBlockId !== undefined) {
    const index = contentArray.indexOf(options.prevBlockId);
    if (index !== -1) {
      contentArray.splice(index + 1, 0, newBlockId);
      return contentArray;
    }
  }

  if (options?.nextBlockId !== undefined) {
    const index = contentArray.indexOf(options.nextBlockId);
    if (index !== -1) {
      contentArray.splice(index, 0, newBlockId);
      return contentArray;
    }
  }

  // Default: append to the end
  contentArray.push(newBlockId);
  return contentArray;
}

export function rearrangeContent(parentBlock: Block, blockId: string, index: number) {
  const contentArray = parentBlock.content;
  contentArray.splice(index, 0, blockId);
  return contentArray;
}

// Needs to be refactored according to the use case
export function findPrevTextBlockInContent(block: Block, blocks: Record<string, Block>, content: string[]) {
  const blockIndexInContent = content.indexOf(block.id);
  const prevTextBlock = blocks[content.reverse().find((id: string, index: number) => index > blockIndexInContent &&  textBlockTypes.includes(blocks[id].type))];
  console.log("prevTextBlock", prevTextBlock);
  return prevTextBlock;
}


