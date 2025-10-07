import { Block } from "../interfaces/Block.interface";

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

export function findPrevBlock() {}


