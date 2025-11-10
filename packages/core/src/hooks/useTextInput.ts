import React, { useMemo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useBlocksContext, useBlock } from "../components/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import {
    updateBlockData,
    findPrevTextBlockInContent,
    getPreviousBlockInContent
} from "../core/updateBlock";
import { useScrollContext } from "../components/ScrollProvider";
import { useBlocksMeasuresContext } from "../components/BlocksMeasuresProvider";
import { useBlockRegistrationContext } from "../components/BlockRegistration";

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
    const { isScrolling } = useScrollContext();
    const { isDragging } = useBlocksMeasuresContext();
    const { textBasedBlocks } = useBlockRegistrationContext();

    const block = useMemo(() => blocks[blockId], [blockId]);
    const title = block.properties.title;
    const inputRef = React.useRef<TextInput>(null);
    const selectionRef = React.useRef({ start: title.length, end: title.length });
    const valueRef = React.useRef(title);
    const isFocused = focusedBlockId === blockId;
    const isEditable = isScrolling === false && isDragging.value === false
        ? true
        : focusedBlockId === blockId
            ? true
            : false;

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
            blur: () => {
                inputRef.current?.blur();
            },
            setSelection: (selection: { start: number; end: number }) => {
                inputRef.current?.setSelection(selection.start, selection.end);
            },
            focusWithSelection: (selection: { start: number; end: number }, text?: string) => {
                /** Find a better way to sync value on block update */
                if (text !== undefined) {
                    inputRef.current?.setNativeProps({ text });
                    /* valueRef.current = text; */
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

    function handleSelectionChange(event: { nativeEvent: { selection: { start: number; end: number; }; }; }) {
        selectionRef.current = event.nativeEvent.selection;
    }

    function handleOnBlur() {
        if (isScrolling) {
            inputRefs.current["ghostInput"]?.current.focus();
        } else {
            const updatedBlock = updateBlockData(blocks[blockId], {
                properties: {
                    title: valueRef.current
                }
            });
            updateBlock(updatedBlock);
        }
    }

    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }) {
        const block = updateBlockData(blocks[blockId], {
            properties:
            { 
                title: valueRef.current
            }
        });

        if (block.id === rootBlockId) return;
        
        const sourceBlock = block;
        const prevTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
        const prevBlock = getPreviousBlockInContent(blockId, blocks);
        const targetBlockId = prevTextBlock === undefined ? sourceBlock.parent : prevTextBlock.id;

        /**
         * If the previous block is a textblock and that block is empty,
         * remove it and keep focus on current block.
         * 
         * Else, merge the current block with the previous block.
         */
        if (blocks[targetBlockId].properties.title.length === 0 && targetBlockId !== sourceBlock.parent && prevBlock.type === "text") {
            requestAnimationFrame(() => {
                removeBlock(targetBlockId);
            });
        } else {
            const textAfterMerge = blocks[targetBlockId].properties.title + sourceBlock.properties.title;

            inputRefs.current[targetBlockId]?.current.setText(textAfterMerge);
            inputRefs.current[targetBlockId]?.current.focusWithSelection({
                start: textAfterMerge.length - sourceBlock.properties.title.length,
                end: textAfterMerge.length - sourceBlock.properties.title.length
            });
            inputRefs.current[sourceBlock.id]?.current.setText("");

            const { prevTitle, newTitle, mergeResult } = mergeBlock(block, targetBlockId);
        }
        
        return;
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
        
        if (block.type !== "text") {
            inputRefs.current["ghostInput"]?.current.focus();
        }

        const { prevBlock, nextBlock } = splitBlock(block, selection);
        inputRefs.current[nextBlock.id]?.current.setSelection({
            start: 0,
            end: 0
        });
        requestAnimationFrame(() => {
            inputRefs.current[nextBlock.id]?.current.setText(nextBlock.properties.title);
            inputRefs.current[nextBlock.id]?.current.focusWithSelection({
                start: 0,
                end: 0
            })
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
            defaultValue: valueRef.current,
            /** Disable multiline text input scrolling. */
            scrollEnabled: false,
            multiline: true,
            selectionColor: "black",
            /** Prevents keyboard from flickering when focusing a new block. */
            submitBehavior: "submit",
            selectTextOnFocus: false,
            smartInsertDelete: false,
            /** Prevents the text input being accidentally focused when scrolling/moving a block. */
            editable: isEditable,

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
        /** Needs review:
         * The below code was commented because some input refs where
         * being unregistered when they where still mounted.
         * It might be related to the text inputs being re rendered.
         *  */
        
        /* return () => {
            unregisterRef(blockId);
            console.log("UnregisterUNREGISTERed block", blockId);
        }; */
    }, [inputRef]);

    return {
        getTextInputProps,
        isFocused
    };
}