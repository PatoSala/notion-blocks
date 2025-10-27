import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { GestureHandlerRootView, GestureUpdateEvent } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
    StyleSheet,
    ScrollView,
    Pressable,
    View,
    Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Block  } from "../interfaces/Block.interface";
import BlockElement from "./Blocks/Block";
import DragProvider from "./DragProvider";
import LayoutProvider from "./LayoutProvider";
import Footer from "./Footer/Footer";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, useBlocksContext, useBlock } from "./Blocks/BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";

const { width } = Dimensions.get("window");

function NoteScreen({
    rootBlockId
}) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const pageId : string = rootBlockId;
    const { blocks: blockTypes } = useBlockRegistrationContext();
    const {
        blocks,
        focusedBlockId,
        insertBlock,
        moveBlocks,
    } = useBlocksContext();
    const { keyboardHeight } = useKeyboardStatus();

    const rootBlock : Block = blocks[pageId];
    const rootBlockContent = useMemo(() => rootBlock.content, [rootBlock.content]);
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

    useEffect(() => {
        // Maybe this conditional could be a function "scrollToVisiblePosition" or sth like that
        if (blockMeasuresRef.current[focusedBlockId]?.start > keyboardHeight + 24) {
            handleScrollTo({
                x: 0,
                y: blockMeasuresRef.current[focusedBlockId]?.start - keyboardHeight,
                animated: true
            })
        }
    }, [focusedBlockId, blocks])

    /** Editor configs */
    const { inputRefs: refs } = useTextBlocksContext();

    const handleNewLineBlock = () => {
        if (rootBlock.content.length === 0 || blocks[rootBlock.content[rootBlock.content.length - 1]].properties.title.length > 0) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: ""
                },
                format: {},
                content: [],
                parent: pageId
            });

            insertBlock(newBlock);
            // Focus new block
            requestAnimationFrame(() => {
                refs.current[newBlock.id]?.current.focus();
            });
        } else {
            // Focus last block (it must be empty)
            requestAnimationFrame(() => {
                refs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
            });
        }
    }
   
    // Components
    const ListHeaderComponent = useCallback(() => (
        <BlockElement
            blockId={pageId}
        />
    ), [rootBlock]); // dependency array set in rootBlock.properties.title was causing the RNB-14 bug.

    const ListFooterComponent = () => (
        <Pressable
            onPress={handleNewLineBlock}
            style={{
                flexGrow: 1,
                height: "100%",
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
            <RenderBlock blockId={ghostBlockId} />
        </Animated.View>
    )

    // Block measures
    const blockMeasuresRef = useRef({});
    const indicatorPosition = useSharedValue({ y: 0 });

    const registerBlockMeasure = (blockId: string, measures: { height: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
    }

    const removeBlockMeasure = (blockId: string) => {
        delete blockMeasuresRef.current[blockId];
    }

    /**
     *  Given a y coordinate, returns the block at that position and a "start" or "end"
     *  string that indicates if the position is closer to the start or end of the block
     * */
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

        return {
            blockId: null,
            closestTo: null
        };
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

    /* const RenderBlock = useCallback((props) => {
        const {
            blockId
        } = props;

        return blockTypes[blocks[blockId].type].component(props);
    }, []); */

    const RenderBlock = (props) => {
        const {
            blockId
        } = props;

        return blockTypes[blocks[blockId].type].component(props);
    };

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

                    {/* For some reason, rendering like this works better. */}
                    {blockTypes[blocks[pageId].type].component({ blockId: pageId })}

                    {rootBlockContent?.map((blockId: string, index: number) => {
                        return (
                            <LayoutProvider
                                key={blockId}
                                blockId={blockId}
                                registerBlockMeasure={registerBlockMeasure}
                                dependancies={blocks[rootBlockId]}
                                removeBlockMeasure={removeBlockMeasure}
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
                                        const { blockId, closestTo } = findBlockAtPosition(e.absoluteY);
                                        
                                        if (blockId) {
                                            indicatorPosition.value = {
                                                y: blockMeasuresRef.current[blockId][closestTo]
                                            }
                                        }
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
                                        {/* <RenderBlock blockId={blockId}/> */}
                                        {/* For some reason, rendering like this works better. */}
                                        {blockTypes[blocks[blockId].type].component({ blockId })}
                                    </View>
                                </DragProvider>
                            </LayoutProvider>
                        )
                    })}

                    <ListFooterComponent />

                </ScrollView>

                {isPressed.value === true && <GhostBlock />}

                <Footer.ContextProvider>
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
    rootBlockId,
    children
}) {
    return (
        <BlockRegistration customBlocks={children}>
            <BlocksProvider defaultBlocks={defaultBlocks} rootBlockId={rootBlockId}>
                <TextBlocksProvider>
                    <NoteScreen rootBlockId={rootBlockId} />
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}

const styles = StyleSheet.create({
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