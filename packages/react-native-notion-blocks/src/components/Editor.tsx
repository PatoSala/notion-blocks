import React, { useRef, useState, useCallback, useContext } from "react";
import { GestureHandlerRootView, Gesture, GestureDetector, GestureUpdateEvent } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  withSpring
} from 'react-native-reanimated';
import {
    StyleSheet,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    View,
    Text,
    Dimensions
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sampleData } from "../utils/sampleData";
import { Block  } from "../interfaces/Block.interface";
import BlockElement from "./Blocks/Block";
import DragProvider from "./DragProvider";
import LayoutProvider from "./LayoutProvider";
import Footer from "./Footer/Footer";
import { updateBlock as updateBlockData, insertBlockIdIntoContent } from "../core/updateBlock";

import { BlocksProvider, useBlocksContext, BlocksContext } from "./Blocks/BlocksContext";

// Temporary
const textBasedBlockTypes = ["text", "header", "sub_header", "sub_sub_header"];

const { width } = Dimensions.get("window");

function NoteScreen({
    rootBlockId
}) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const pageId : string = rootBlockId;
    const {
        blocks,
        insertBlock,
        moveBlocks,
        turnBlockInto,
    } = useBlocksContext();

    const rootBlock : Block = blocks[pageId];
    const [focusedBlockId, setFocusedBlockId] = useState(null); // It's pnly used by the Footer
    const scrollY = useSharedValue(0);

    const handleScroll = (event: { nativeEvent: { contentOffset: { y: number; }; }; }) => {
        scrollY.value = Math.round(event.nativeEvent.contentOffset.y);
    };

    const handleScrollTo = ({ x, y, animated } : { x: number, y: number, animated: boolean }) => {
        scrollViewRef.current?.scrollTo({
            x: x,
            y: y,
            animated: animated
        });
    }

    /** Editor configs */
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(true);

    /** TextInput refs of text based blocks */
    const refs = useRef({}); // TextInputs refs

    function registerRef(blockId: string, ref: any) {
        refs.current[blockId] = ref;
    }

    function unregisterRef(blockId: string) {
        delete refs.current[blockId];
    }

    const handleNewLineBlock = () => {
        if (rootBlock.content.length === 0 || blocks[rootBlock.content[rootBlock.content.length - 1]].properties.title.length > 0) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: ""
                },
                content: [],
                parent: pageId
            });

            insertBlock(newBlock);
            // Focus new block
            requestAnimationFrame(() => {
                refs.current[newBlock.id]?.current.focus();
            });
        } else {
            // Focus new block
            requestAnimationFrame(() => {
                refs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
            });
        }
    }
   
    // Components
    const ListHeaderComponent = useCallback(() => (
        <BlockElement
            key={pageId}
            blockId={pageId}
            refs={refs}
            block={rootBlock}
            title={rootBlock.properties.title}
            showSoftInputOnFocus={showSoftInputOnFocus}
            registerRef={registerRef}
            /* handleScrollTo={handleScrollTo} */
            unregisterRef={unregisterRef}
            onFocus={() => {
                setFocusedBlockId(rootBlock.id);
            }}
        />
    ), [rootBlock]); // dependency array set in rootBlock.properties.title was causing the RNB-14 bug.

    const ListFooterComponent = () => (
        <Pressable
            onPress={handleNewLineBlock}
            style={{
                flexGrow: 1,
                height: "100%"
            }}
        />
    )

    // Ghost block
    const isPressed = useSharedValue(false);
    const offset = useSharedValue({ x: 0, y: 0 });
    const [ghostBlockId, setGhostBlockId] = useState(null);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                /* { translateY: offset.value.y }, */
            ],
            top: offset.value.y,
            display: isPressed.value === false ? 'none' : 'flex',
            borderWidth: isPressed.value === true ? 1 : 0,
            borderRadius: 5
        };
    });

    const GhostBlock = () => (
        <Animated.View style={[{
            opacity: 0.5,
            position: "absolute",
            width: "100%"
        }, animatedStyles]}>
            <BlockElement
                blockId={ghostBlockId}
                block={blocks[ghostBlockId]}
                title={blocks[ghostBlockId].properties.title}
            />
        </Animated.View>
    )

    // Block measures
    const blockMeasuresRef = useRef({});
    const indicatorPosition = useSharedValue({ y: 0 });

    const registerBlockMeasure = (blockId: string, measures: { height: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
    }

    const findBlockAtPosition = (y: number) : { blockId: string, closestTo: "start" | "end" } => {
        const withScrollY = y + scrollY.value;
        
        for (const blockId in blockMeasuresRef.current) {
            const { start, end } = blockMeasuresRef.current[blockId];
            if (withScrollY >= start && withScrollY <= end) {
                
                const closestTo = withScrollY - start > end - withScrollY ? "end" : "start";

                return {
                    blockId,
                    closestTo
                };
            }
        }

    }

    const functionDetermineIndicatorPosition = (y: number) => {
        const withScrollY = y + scrollY.value;
        for (const blockId in blockMeasuresRef.current) {
            const { start, end } = blockMeasuresRef.current[blockId];
            if (withScrollY >= start && withScrollY <= end) {
                
                const closestTo = withScrollY - start > end - withScrollY ? "end" : "start";

                indicatorPosition.value = {
                    y: blockMeasuresRef.current[blockId][closestTo]
                }
            }
        }
    }

    const handleMoveBlock = () => {
        if (!ghostBlockId) return;

        const blockToMove = blocks[ghostBlockId];
        const targetBlock = findBlockAtPosition(indicatorPosition.value.y); // Passing the indicator position fixes de out of bounds error since the indicator value will always be positioned at the start ot end of a block

        
        moveBlocks(blockToMove.id, blockToMove.parent, targetBlock.blockId, targetBlock.closestTo);
        // re measure blocks
    }

    const indicatorAnimatedStyles = useAnimatedStyle(() => {
        return {
            top: indicatorPosition.value.y
        }
    })

    const Indicator = () => (
        <Animated.View style={[
            styles.indicator,
            indicatorAnimatedStyles,
            {
                display: indicatorPosition.value.y === 0 ? "none" : "flex"
            }
        ]} />
    )

    return (
        <GestureHandlerRootView>
                    <ScrollView
                        ref={scrollViewRef}
                        onScroll={handleScroll}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingTop: insets.top,
                            paddingHorizontal: 8,
                        }}
                        keyboardShouldPersistTaps="always"
                        automaticallyAdjustKeyboardInsets
                    >
                        <Indicator />

                        <ListHeaderComponent />

                        {rootBlock.content?.map((blockId: string) => {
                            return (
                                <LayoutProvider
                                    key={blockId}
                                    blockId={blockId}
                                    registerBlockMeasure={registerBlockMeasure}
                                    dependancies={blocks[pageId]}
                                >
                                    <DragProvider
                                        onDragStart={() => {
                                            isPressed.value = true;
                                            setGhostBlockId(blockId);
                                        }}
                                        onDragUpdate={(e: GestureUpdateEvent, start: { x: number, y: number }) => {
                                            offset.value = {
                                                x: e.translationX + start.x,
                                                y: e.translationY + start.y,
                                            };
                                            functionDetermineIndicatorPosition(e.absoluteY);
                                        }}
                                        onDragEnd={() => {
                                            handleMoveBlock();
                                            isPressed.value = false;
                                            setGhostBlockId(null);
                                            offset.value = { x: 0, y: 0 };
                                            indicatorPosition.value = { y: 0 };
                                        }}
                                    >
                                        <View>
                                            <BlockElement
                                                blockId={blockId}
                                                block={blocks[blockId]}
                                                title={blocks[blockId].properties.title}
                                                // Temporary: TextInputs refs
                                                refs={refs}
                                                showSoftInputOnFocus={showSoftInputOnFocus}
                                                registerRef={registerRef}
                                                unregisterRef={unregisterRef}
                                                onFocus={() => {
                                                    setFocusedBlockId(blockId);
                                                }}
                                            />
                                        </View>
                                    </DragProvider>
                                </LayoutProvider>
                            )
                        })}

                        <ListFooterComponent />

                    </ScrollView>

                {isPressed.value === true && <GhostBlock />}

                <Footer.ContextProvider
                    // Maybe a context for text input related data should be created (refs, focusedBlockId, showSoftInputOnFocus, etc) 
                    refs={refs}
                    setShowSoftInputOnFocus={setShowSoftInputOnFocus}
                >
                    <Footer>
                        <Footer.AddBlock />
                        <Footer.TurnBlockInto />
                    </Footer>
                </Footer.ContextProvider>
        </GestureHandlerRootView>
    )
}

export default function Editor({
    defaultBlocks,
    rootBlockId
}) {
    return (
        <BlocksProvider defaultBlocks={defaultBlocks} rootBlockId={rootBlockId}>
            <NoteScreen rootBlockId={rootBlockId} />
        </BlocksProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 8
    },
    blockOptionsContainer: {
        backgroundColor: "#f5f5f5",
        padding: 16
    },
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        minWidth: "50%",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)"
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    indicator: {
        height: 3,
        width: width - 32,
        marginLeft: 16,
        boxSizing: "border-box",
        opacity: 0.5,
        backgroundColor: "#0277e4ff",
        position: "absolute"
    }
});