import { useContext, useState, useRef, useEffect, useImperativeHandle, memo } from "react";
import { Text, View, StyleSheet, TextInput, Dimensions } from "react-native";
import { Block } from "../interfaces/Block.interface";
import { updateBlock } from "../core";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { Pressable } from "react-native-gesture-handler";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface Props {
    blockId: string;
    block: Block;
    title: string;
    handleOnBlur?: () => void;
    onFocus?: () => void;
    handleSubmitEditing?: () => void;
    handleOnKeyPress?: (event: { nativeEvent: { key: string; }; }, blockId: string) => void;
    handleOnChangeText?: (blockId: string, text: string) => void;
    registerRef?: (blockId: string, ref: any) => void;
    unregisterRef?: (blockId: string) => void;
    selectionState?: { start: number, end: number };
    showSoftInputOnFocus?: boolean;
    handleScrollTo?: () => void;
    onLongPress?: () => void;
    onPressOut?: () => void;
    onPress?: () => void;
    editable?: boolean;
}

const BlockElement = memo(({
    blockId,
    block,
    title,
    handleOnBlur,
    onFocus,
    onLongPress,
    onPress,
    editable,
    onPressOut,
    handleSubmitEditing,
    handleOnChangeText,
    handleOnKeyPress,
    registerRef,
    unregisterRef,
    showSoftInputOnFocus,
    handleScrollTo
} : Props) => {

    if (block === undefined) {
        /** Setting this to null might be a good hotfix. */
        return <Text>Block not found. Id: {blockId}</Text>
    }
    const ref = useRef<TextInput>(null);
    const viewRef = useRef<View>(null);
    const selectionRef = useRef({ start: block.properties.title.length, end: block.properties.title.length });
    const valueRef = useRef(title);
    const { keyboardY, keyboardHeight } = useKeyboardStatus();

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
            measureLayout: (scrollviewRef) => {
                viewRef.current?.measureLayout(scrollviewRef, (x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            }
        }
    };

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

    return (
        <>
            {/* <GestureDetector gesture={composed}> */}
                <View style={[styles.container]}>
                    <TextInput
                        ref={ref}
                        scrollEnabled={false}
                        style={[styles[block.type], {
                            textAlignVertical: "top",
                            flexShrink: 0,
                            flexGrow: 1,
                        }]}
                        multiline
                        cursorColor={"black"}
                        selectionColor={"black"}
                        submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
                        onChangeText={(text) => {
                            valueRef.current = text;

                        }}
                        onSelectionChange={({ nativeEvent }) => {
                            selectionRef.current = nativeEvent.selection;
                        }}
                        showSoftInputOnFocus={showSoftInputOnFocus}
                        smartInsertDelete={false}
                        onFocus={onFocus}
                        defaultValue={valueRef.current}
                        selectTextOnFocus={false}
                        onBlur={() => handleOnChangeText && handleOnChangeText(blockId, valueRef.current)}
                        onSubmitEditing={() => {
                            handleSubmitEditing && handleSubmitEditing(
                                updateBlock(block, {
                                    properties:
                                    { 
                                        title: valueRef.current
                                    }
                                }),
                                selectionRef.current
                            );
                        }}
                        onKeyPress={(event) => {
                            event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0 ? handleOnKeyPress && handleOnKeyPress(
                                event,
                                updateBlock(block, {
                                    properties:
                                    { 
                                        title: valueRef.current
                                    }
                                }),
                                selectionRef.current
                            ) : null;

                            // Get coordinates of the block. If coordinates are under the keyboard, scroll up.
                            ref.current?.measureInWindow((x, y, width, height) => {
                                if (y > keyboardY) {
                                    handleScrollTo && handleScrollTo({
                                        x: 0,
                                        y: y - 44,
                                        animated: true
                                    });
                                }
                            })
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
        marginVertical: 6,
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