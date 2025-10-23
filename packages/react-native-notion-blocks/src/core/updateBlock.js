"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlock = updateBlock;
exports.insertBlockIdIntoContent = insertBlockIdIntoContent;
exports.rearrangeContent = rearrangeContent;
exports.findPrevBlock = findPrevBlock;
/**
 * @param block Block to update
 * @param updatedData Updated block data
 * @returns Updated block
 */
function updateBlock(block, updatedData) {
    var updatedBlock = __assign(__assign({}, block), updatedData);
    return updatedBlock;
}
/** Inserts a new block ID into the content array. If no prevBlockId or nextBlockId is provided, it will be appended to the end. */
function insertBlockIdIntoContent(contentArray, newBlockId, options) {
    if ((options === null || options === void 0 ? void 0 : options.prevBlockId) !== undefined) {
        var index = contentArray.indexOf(options.prevBlockId);
        if (index !== -1) {
            contentArray.splice(index + 1, 0, newBlockId);
            return contentArray;
        }
    }
    if ((options === null || options === void 0 ? void 0 : options.nextBlockId) !== undefined) {
        var index = contentArray.indexOf(options.nextBlockId);
        if (index !== -1) {
            contentArray.splice(index, 0, newBlockId);
            return contentArray;
        }
    }
    // Default: append to the end
    contentArray.push(newBlockId);
    return contentArray;
}
function rearrangeContent(parentBlock, blockId, index) {
    var contentArray = parentBlock.content;
    contentArray.splice(index, 0, blockId);
    return contentArray;
}
function findPrevBlock() { }
