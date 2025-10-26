import { useContext, useState, useRef, useEffect, useImperativeHandle, memo, RefObject, useLayoutEffect } from "react";
import { Text, View, StyleSheet, TextInput, Dimensions, ScrollView, findNodeHandle } from "react-native";
import { Block } from "../../interfaces/Block.interface";
import { updateBlock as updateBlockData } from "../../core/updateBlock";
import { useKeyboardStatus } from "../../hooks/useKeyboardStatus";
import { useBlocksContext } from "./BlocksContext";

export interface BlockProps {
    blockId: string;
    block: Block;
    title: string;
    refs?: Record<string, RefObject<TextInput>>;
    registerRef?: (blockId: string, ref: any) => void;
    unregisterRef?: (blockId: string) => void;
    showSoftInputOnFocus?: boolean;
    handleScrollTo?: () => void;
}

const BlockElement = memo(({
    blockId,
    block,
    title,
    refs,
    registerRef,
    unregisterRef,
    showSoftInputOnFocus,
} : BlockProps) => {

    if (block === undefined) {
        /** Setting this to null might be a good hotfix. */
        return <Text>Block not found. Id: {blockId}</Text>
    }
    const ref = useRef<TextInput>(null);
    const viewRef = useRef<View>(null);
    const selectionRef = useRef({ start: block.properties.title.length, end: block.properties.title.length });
    const valueRef = useRef(title);
    const { keyboardY } = useKeyboardStatus();
    const { blocks, rootBlockId, setFocusedBlockId, updateBlock, insertBlock, mergeBlock, splitBlock } = useBlocksContext();

    const api = {
        current: {
            setText: (text: string) => {
                ref.current?.setNativeProps({ text });
                valueRef.current = text;
            },
            focus: () => {
                ref.current?.focus();
            },
            focusWithSelection: (selection: { start: number; end: number }, text?: string) => {
                /** Find a better way to sync value on block update */
                if (text !== undefined) {
                    requestAnimationFrame(() => {
                        ref.current?.setNativeProps({ text });
                        valueRef.current = text;
                    })
                }

                ref.current?.setSelection(selection.start, selection.end); // Sync native input with selection state
                selectionRef.current = selection;
                ref.current?.focus();
            },
            getPosition: () => {
                ref.current?.measureInWindow((x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            },
            measureLayout: () => {
                viewRef.current?.measure((x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            }
        }
    };

    // Find a better way to sync with state
    useEffect(() => {
        requestAnimationFrame(() => {
            api.current.setText(title);
        })
    }, [title])

    useEffect(() => {
        // Register ref on block mount. This will allow us to set focus/selection from the parent.
        registerRef && registerRef(blockId, api);
        
        return () => {
            unregisterRef && unregisterRef(blockId);
        };
    }, []);

    // TextInput event handlers
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
            // The following is like an "optimistic update", we set the block's content before update
            const sourceBlock = block;
            const parentBlock = blocks[sourceBlock.parent];
            const sourceBlockContentIndex = parentBlock.content.indexOf(sourceBlock.id);
            const isFirstChild = sourceBlockContentIndex === 0;
            const targetBlock = isFirstChild
                ? parentBlock
                : blocks[parentBlock.content[sourceBlockContentIndex - 1]];

            refs.current[sourceBlock.id].current.setText(targetBlock.properties.title + sourceBlock.properties.title);

            const { prevTitle, newTitle, mergeResult } = mergeBlock(block);
            // Focus previous block here
            const newCursorPosition = newTitle.length - prevTitle.length;
            /* console.log("New cursor position: ", newCursorPosition); */
            requestAnimationFrame(() => {
                refs.current[mergeResult.id]?.current.focusWithSelection({
                    start: newCursorPosition,
                    end: newCursorPosition
                });
            })
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

        // The following is like an "optimistic update", we set the block's content before update
        refs.current[block.id]?.current.focusWithSelection({
            start: 0,
            end: 0
        }, textAfterSelection);

        const { splitResult } = splitBlock(block, selection);
        
        requestAnimationFrame(() => {
            refs.current[splitResult.id]?.current.focusWithSelection({
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
    
    return (
        <>
            <View style={[styles.container]} ref={viewRef}>
                <TextInput
                    ref={ref}
                    scrollEnabled={false}
                    style={[styles[block.type], {
                        textAlignVertical: "top",
                        flexShrink: 0,
                        flexGrow: 1,
                    }]}
                    multiline
                    selectionColor={"black"}
                    submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
                    
                    onSelectionChange={handleSelectionChange}
                    showSoftInputOnFocus={showSoftInputOnFocus}
                    smartInsertDelete={false}
                    defaultValue={valueRef.current}
                    selectTextOnFocus={false}
                    onChangeText={handleChangeText}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    onSubmitEditing={handleSubmitEditing}
                    onKeyPress={(event) => {
                        event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0
                        ? handleOnKeyPress(event)
                        : null;
                    }}
                />
            </View>
        </>
    )
});

export default BlockElement;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    page: {
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 36,
        minHeight: 36,
        marginTop: 36,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        minHeight: 24,
        flexWrap: "wrap"
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        minHeight: 34,
        flexWrap: "wrap"
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        marginTop: 24,
        marginBottom: 4,
        lineHeight: 30,
        minHeight: 30,
        flexWrap: "wrap"
    },
    sub_sub_header: {
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 20,
        marginBottom: 4,
        lineHeight: 26,
        minHeight: 26,
        flexWrap: "wrap"
    }
});