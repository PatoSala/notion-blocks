import React, { useMemo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useBlocksContext, useBlock } from "../components/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import { scheduleOnUI } from "react-native-worklets";
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
    const { textBasedBlocks, defaultBlockType } = useBlockRegistrationContext();

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
                selectionRef.current = selection;
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
        /* remasureBlockLayout(blockId) */
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
        if (blocks[targetBlockId].properties.title.length === 0 && targetBlockId !== sourceBlock.parent && prevBlock.type === defaultBlockType) {
            requestAnimationFrame(() => {
                removeBlock(targetBlockId);
            });
        } else {
            const { prevTitle, newTitle, mergeResult } = mergeBlock(block, targetBlockId);

            inputRefs.current[mergeResult.id]?.current.setText(mergeResult.properties.title);
            inputRefs.current[mergeResult.id]?.current.setSelection({
                start: mergeResult.properties.title.length - sourceBlock.properties.title.length,
                end: mergeResult.properties.title.length - sourceBlock.properties.title.length
            });
            inputRefs.current[mergeResult.id]?.current.focus();
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

        /**
         * This is a hack.
         * When splitting a block into another block type, the current block must rerender to change to the corresponding block component.
         * That rerender can make the keyboard flicker, so to prevent that we need to focus the ghost input and after the render, focus the block again.
         *  */

        if (block.type !== defaultBlockType) {
            console.log("Focus ghost input");
            inputRefs.current["ghostInput"]?.current.focus();
        }

        /**
         * The timeout is bearly noticeable, but it is needed to prevent the keyboard from flickering.
         * It gives times for the ghost input to be focused before rerendering any block, preventing
         * keyboard flickering.
         */
        setTimeout(() => {
            const { prevBlock, nextBlock } = splitBlock(block, selection);

        if (prevBlock.id === rootBlockId) {
            // Since in this scenario a new block is created, we focus after animation.
            requestAnimationFrame(() => {
                inputRefs.current[prevBlock.id]?.current.setText(prevBlock.properties.title);

                inputRefs.current[nextBlock.id]?.current.setText(nextBlock.properties.title);
                inputRefs.current[nextBlock.id]?.current.focus();
                inputRefs.current[nextBlock.id]?.current.setSelection({
                    start: 0,
                    end: 0
                });
            });

        } else {
            requestAnimationFrame(() => {
                inputRefs.current[nextBlock.id].current.setText(nextBlock.properties.title);
                inputRefs.current[nextBlock.id]?.current.setSelection({
                    start: 0,
                    end: 0
                });
                inputRefs.current[nextBlock.id]?.current.focus();
            })
        }
        }, 0);
        
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

            /** 
             * PATCH: Know issue on latest react-native version.
             * [#52854](https://github.com/facebook/react-native/issues/52854)
             */
            if (title.length === 0) {
                inputRef.current.setNativeProps({ text: " " });
                inputRef.current.setNativeProps({ text: "" });
            }
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