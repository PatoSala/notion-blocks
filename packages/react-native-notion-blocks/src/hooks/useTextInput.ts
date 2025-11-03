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
import { useScrollContext } from "../components/ScrollProvider";

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
        const prevTextBlock = findPrevTextBlockInContent(blockId, blocks);
        const targetBlockId = prevTextBlock === undefined ? sourceBlock.parent : prevTextBlock.id;

        if (blocks[targetBlockId].properties.title.length === 0 && targetBlockId !== sourceBlock.parent) {
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
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);

        inputRefs.current["ghostInput"]?.current.focus();

        const { prevBlock, nextBlock } = splitBlock(block, selection);

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
            editable: !isScrolling,
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