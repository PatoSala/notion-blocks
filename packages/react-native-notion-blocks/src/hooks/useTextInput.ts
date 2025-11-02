import React, { useMemo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useBlocksContext, useBlock } from "../components/Blocks/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import { useSharedValue } from "react-native-reanimated";
import {
    updateBlock as updateBlockData,
    findPrevTextBlockInContent,
    textBlockTypes,
    getPreviousBlockInContent
} from "../core/updateBlock";

export function useTextInput(blockId: string) {
    const {
        blocks,
        rootBlockId,
        focusedBlockId,
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
    const block = useMemo(() => blocks[blockId], [blockId]);
    const title = block.properties.title;

    const inputRef = React.useRef<TextInput>(null);
    const selectionRef = React.useRef({ start: title.length, end: title.length });
    const valueRef = React.useRef(title);
    const height = useSharedValue(0);

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

    const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number; }; }; }) => {
        height.value = event.nativeEvent.contentSize.height;
    }

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

            
            inputRefs.current["ghostInput"]?.current.focus();

            if (parentBlock.id === rootBlockId) {

                /** First: check if the previous block is not a text block of if it is the first block in the content array of the parent block. */
                if (isFirstChild || !textBlockTypes.includes(getPreviousBlockInContent(sourceBlock.id, blocks).type)) {
                    /** Note for the future: It should be checked if the current block is nested, in which case the block should be poped out of the current content array. */
                    const prevTextBlockInContent = findPrevTextBlockInContent(sourceBlock.id, blocks);
                    
                    /**
                     * If there is no previous text block in the content array, or if its the first block in the content array of the parent,
                     * set as target the parent block.
                     * If there is a previous text block, set as target the previous text block.
                     */
                    const targetBlock = isFirstChild || prevTextBlockInContent === undefined // If there is no previous text block
                        ? parentBlock
                        : prevTextBlockInContent;
                        
                    // ????
                    if (targetBlock === undefined) return;

                    const { prevTitle, newTitle, mergeResult } = mergeBlock(block, targetBlock.id);
                    inputRefs.current[targetBlock.id].current.setText(targetBlock.properties.title + sourceBlock.properties.title);

                    const newCursorPosition = newTitle.length - prevTitle.length;
                    requestAnimationFrame(() => {
                        inputRefs.current[mergeResult.id]?.current.focusWithSelection({
                            start: newCursorPosition,
                            end: newCursorPosition
                        });
                    })
                    return;
                    
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
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);

        inputRefs.current["ghostInput"]?.current.focus();

        const { prevBlock, nextBlock } = splitBlock(block, selection);
        console.log("PREV BLOCK", prevBlock.properties.title);
        console.log("NEXT BLOCK", nextBlock.properties.title);
        requestAnimationFrame(() => {
            inputRefs.current[prevBlock.id]?.current.setText(prevBlock.properties.title);
            inputRefs.current[nextBlock.id]?.current.setText(nextBlock.properties.title);

            inputRefs.current[nextBlock.id]?.current.focusWithSelection({
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
            /* style: {
                height: height.value
            }, */

            onContentSizeChange: handleContentSizeChange,
            onSelectionChange: handleSelectionChange,
            showSoftInputOnFocus: showSoftInputOnFocus,
            onChangeText: handleChangeText,
            onBlur: handleOnBlur,
            onFocus: handleOnFocus,
            onSubmitEditing: handleSubmitEditing,
            onKeyPress: (event) => {
                if (event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0) {
                    handleOnKeyPress(event);
                }
            }
            
        }
    }

    React.useEffect(() => {
        if (inputRef.current) {
            registerRef(blockId, api);
        }
        /* return () => {
            unregisterRef(blockId);
            console.log("UnregisterUNREGISTERed block", blockId);
        }; */
    }, [inputRef]);

    return { getTextInputProps, height };
}