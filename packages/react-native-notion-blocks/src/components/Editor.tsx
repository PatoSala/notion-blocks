import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { GestureHandlerRootView, GestureUpdateEvent } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
    Pressable,
    View,
    Dimensions
} from "react-native";
import { Block  } from "../interfaces/Block.interface";
import DragProvider from "./DragProvider";
import LayoutProvider from "./LayoutProvider";
import Footer from "./Footer/Footer";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, useBlocksContext, useBlock } from "./Blocks/BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider, useScrollContext } from "./ScrollProvider";
import { BlocksMeasuresProvider, useBlocksMeasuresContext } from "./BlocksMeasuresProvider";

function NoteScreen({
    rootBlockId
}) {
    const pageId : string = rootBlockId;
    const { blocks: blockTypes } = useBlockRegistrationContext();
    const {
        blocks,
        blocksOrder,
        insertBlock,
    } = useBlocksContext();
    const { keyboardHeight } = useKeyboardStatus();

    const rootBlock : Block = blocks[pageId];

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
 
    const ListFooterComponent = () => (
        <Pressable
            onPress={handleNewLineBlock}
            style={{
                flexGrow: 1,
                height: keyboardHeight + 64,
            }}
        />
    )

    return (
        <>
            {blocksOrder.map((blockId: string, index: number) => {
                const Component = blockTypes[blocks[blockId].type];
                return (
                    <LayoutProvider key={blockId} blockId={blockId} >
                        <DragProvider blockId={blockId}>
                            <View>
                                <Component blockId={blockId} />
                            </View>
                        </DragProvider>
                    </LayoutProvider>
                )
            })}

            <ListFooterComponent />
        </>
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
                    <GestureHandlerRootView>
                        <BlocksMeasuresProvider>
                            <ScrollProvider>
                                <NoteScreen rootBlockId={rootBlockId} />
                            </ScrollProvider>
                        </BlocksMeasuresProvider>


                        <Footer.ContextProvider>
                            <Footer>
                                <Footer.AddBlock />
                                <Footer.TurnBlockInto />
                            </Footer>
                        </Footer.ContextProvider>
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}