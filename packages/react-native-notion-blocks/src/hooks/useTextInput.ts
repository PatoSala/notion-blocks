import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { useBlocksContext, useBlock } from "../components/Blocks/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import {
    updateBlock as updateBlockData,
    findPrevTextBlockInContent,
    textBlockTypes,
    getPreviousBlockInContent
} from "../core/updateBlock";

export function useTextInput(blockId: string) {
    if (blockId === undefined) throw new Error("blockId is undefined");

    const {
        blocks,
        rootBlockId,
        setFocusedBlockId,
        updateBlock,
        insertBlock,
        mergeBlock,
        splitBlock,
        removeBlock
    } = useBlocksContext();
    const {
        registerRef,
        unregisterRef,
        showSoftInputOnFocus,
        inputRefs
    } = useTextBlocksContext();
    const block = blocks[blockId];
    const title = block.properties.title;

    const inputRef = React.useRef<TextInput>(null);
    const selectionRef = React.useRef({ start: title.length, end: title.length });
    const valueRef = React.useRef(title);

    const api = {
        current: {
            getText: () => valueRef.current,
            setText: (text: string) => {
                inputRef.current?.setNativeProps({ text });
                valueRef.current = text;
            },
            focus: () => {
                inputRef.current?.focus();
            },
            focusWithSelection: (selection: { start: number; end: number }, text?: string) => {
                /** Find a better way to sync value on block update */
                if (text !== undefined) {
                    requestAnimationFrame(() => {
                        inputRef.current?.setNativeProps({ text });
                        valueRef.current = text;
                    })
                }

                inputRef.current?.setSelection(selection.start, selection.end); // Sync native input with selection state
                selectionRef.current = selection;
                inputRef.current?.focus();
            },
            getPosition: () => {
                inputRef.current?.measureInWindow((x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            }
        }
    };

    React.useEffect(() => {
        registerRef && registerRef(blockId, api);
        
        return () => {
            unregisterRef && unregisterRef(blockId);
        };
    }, []);

    function handleSelectionChange(event: { nativeEvent: { selection: { start: number; end: number; }; }; }) {
        selectionRef.current = event.nativeEvent.selection;
    }
    function handleOnBlur() {
        const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: valueRef.current
            }
        });
        updateBlock(updatedBlock);
    }

    /** Used to handle Backspace press when cursor at the start of the block */
    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }) {
        const block = updateBlockData(blocks[blockId], {
            properties:
            { 
                title: valueRef.current
            }
        });
        const selection = selectionRef.current;
        if (block.id === rootBlockId) return;
        /**
         * If block is not empty and cursor is at start, merge block with previous block.
         */
        if (event.nativeEvent.key === "Backspace" && (selection.start === 0 && selection.end === 0)) {
            const sourceBlock = block;
            const parentBlock = blocks[sourceBlock.parent];
            const sourceBlockContentIndex = parentBlock.content.indexOf(blockId);
            const isFirstChild = sourceBlockContentIndex === 0;

            /** To do: Optimizations:
             * - If is child of root:
             *      - If block is first child, merge with parent (root).
             *      - If prev block is text block, perform old mergeBlock strategy.
             *      - If prev block is not text block, perform new mergeBlock strategy.
             * - If block is nested, pop out to grandparent's content array.
             */

            if (parentBlock.id === rootBlockId) {

                // The following is like an "optimistic update", we set the block's content before update
                

                /** First: check if the previous block is a text block */
                /* const immediatePrviousBlock = parentBlock.content[sourceBlockContentIndex - 1];
                const immediatePrviousBlockType = textBlockTypes.includes(blocks[immediatePrviousBlock].type); */
                if (isFirstChild || !textBlockTypes.includes(getPreviousBlockInContent(sourceBlock.id, blocks).type)) {
                    /** Note for the future: if is nested should also be check, in which case the block should be poped out of the current content array. */
                    const prevTextBlockInContent = findPrevTextBlockInContent(sourceBlock.id, blocks);
                    const targetBlock = isFirstChild || prevTextBlockInContent === undefined // If there is no previous text block
                        ? parentBlock
                        : prevTextBlockInContent;
                        
                    if (targetBlock === undefined) return;

                    inputRefs.current[targetBlock.id].current.setText(targetBlock.properties.title + sourceBlock.properties.title);

                    requestAnimationFrame(() => {
                        inputRefs.current[targetBlock.id]?.current.focusWithSelection({
                            start: targetBlock.properties.title.length,
                            end: targetBlock.properties.title.length
                        });
                    });
                    
                    requestAnimationFrame(() => {
                        removeBlock(sourceBlock.id);
                    })
                } else if (textBlockTypes.includes(getPreviousBlockInContent(sourceBlock.id, blocks).type)) {
                    const targetBlock = getPreviousBlockInContent(sourceBlock.id, blocks);

                    inputRefs.current[sourceBlock.id].current.setText(targetBlock.properties.title + sourceBlock.properties.title);

                    const { prevTitle, newTitle, mergeResult } = mergeBlock(block, targetBlock.id);
                    // Focus previous block here
                    const newCursorPosition = newTitle.length - prevTitle.length;
                    requestAnimationFrame(() => {
                        inputRefs.current[mergeResult.id]?.current.focusWithSelection({
                            start: newCursorPosition,
                            end: newCursorPosition
                        }, /* mergeResult.properties.title */);
                    })
                    return;
                }

            }
            return;
        }
    }

    const handleSubmitEditing = () => {
        const block = updateBlockData(
            blocks[blockId],
            {
                properties:
                { 
                    title: valueRef.current
                }
            }
        );
        const selection = selectionRef.current;
        
        const textAfterSelection = block.properties.title.substring(selection.end);

        // The following is like an "optimistic update", we set the block's content before update
        inputRefs.current[blockId]?.current.focusWithSelection({
            start: 0,
            end: 0
        }, textAfterSelection);

        const { splitResult, updatedBlock } = splitBlock(block, selection);
        
        requestAnimationFrame(() => {
            inputRefs.current[updatedBlock.id]?.current.setText(updatedBlock.properties.title);
            inputRefs.current[splitResult.id]?.current.focusWithSelection({
                start: 0,
                end: 0
            });
        });
        return;
    };

    const handleOnFocus = () => {
        setFocusedBlockId(blockId);
    }

    const handleChangeText = (text: string) => {
        valueRef.current = text;
    }

    const getTextInputProps : () => TextInputProps = () => {
        return {
            ref: inputRef,
            scrollEnabled: false,
            multiline: true,
            selectionColor: "black",
            submitBehavior: "submit", // Prevents keyboard from flickering when focusing a new block
            selectTextOnFocus: false,
            smartInsertDelete: false,
            defaultValue: valueRef.current,

            onSelectionChange: handleSelectionChange,
            showSoftInputOnFocus: showSoftInputOnFocus,
            onChangeText: handleChangeText,
            onBlur: handleOnBlur,
            onFocus: handleOnFocus,
            onSubmitEditing: handleSubmitEditing,
            onKeyPress: (event) => {
                event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0
                ? handleOnKeyPress(event)
                : null;
            }
        }
    }

    return { getTextInputProps };
}