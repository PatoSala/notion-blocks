import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    Pressable,
    View
} from "react-native";
import { Block  } from "../interfaces/Block.interface";
import DragProvider from "./DragProvider";
import { LayoutProvider } from "./LayoutProvider";
import Footer from "./Footer/Footer";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, useBlocksContext, useBlock } from "./BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider, useScrollContext } from "./ScrollProvider";
import { BlocksMeasuresProvider, useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import * as Crypto from 'expo-crypto';

function RenderTree({
    rootBlockId
}) {
    const { blockTypes, defaultBlockType } = useBlockRegistrationContext();
    const {
        blocks,
        blocksOrder,
        insertBlock,
    } = useBlocksContext();
    const { keyboardHeight } = useKeyboardStatus();

    // Root block in this speecific case equals the first (and only) block of the "root" block.
    const rootBlock : Block = blocks[blocksOrder[0]];

    /** Editor configs */
    const { inputRefs } = useTextBlocksContext();

    const handleNewLineBlock = () => {
        if (
            blocks[blocksOrder[blocksOrder.length - 1]].type === defaultBlockType
            && blocks[blocksOrder[blocksOrder.length - 1]].properties?.title.length === 0
        ) {
            inputRefs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
        } else {
            const newBlock = new Block({
                type: defaultBlockType,
                properties: {
                    title: ""
                },
                format: {},
                content: [],
                parent: rootBlock.id
            });

            insertBlock(newBlock);
            // Focus new block
            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            });
        }
    }
 
    const ListFooterComponent = () => (
        <Pressable
            onPress={handleNewLineBlock}
            style={{
                flexGrow: 1,
                minHeight: keyboardHeight + 64,
                backgroundColor: "transparent"
            }}
        />
    )

    return (
        <>
            {/* Wee concat the "root" content (should be just one item) with the content of its only child. */}
            {blocksOrder.map((blockId: string, index: number) => {
                const Component = blockTypes[blocks[blockId].type].component;
                return (
                    <View key={`component-${blockId}`} style={{ backgroundColor: "transparent" }}> 
                        <LayoutProvider blockId={blockId} >
                            <DragProvider blockId={blockId}>
                                <View>
                                    <Component blockId={blockId} />
                                </View>
                            </DragProvider>
                        </LayoutProvider>
                    </View>
                )
            })}

            <ListFooterComponent />
        </>
    )
}

/**
 * @param props.defaultBlocks
 * @param props.customBlocks
 * @param props.defaultBlockType The block type to be used as output of some actions, for example splitting a block.
 * @param props.extractBlocks
 * @param props.children
 */
export function Editor({
    defaultBlocks,
    rootBlockId,
    children,
    defaultBlockType,
    extractBlocks,
    contentContainerStyle
}) {

    if (defaultBlockType === undefined) throw new Error("defaultBlockType is required");
    if (rootBlockId === undefined) throw new Error("rootBlockId is required");
    if (children === undefined) throw new Error("children is required");

    return (
        <BlockRegistration customBlocks={children} defaultBlockType={defaultBlockType}>
            <BlocksProvider
                defaultBlocks={defaultBlocks}
                rootBlockId={rootBlockId}
                extractBlocks={extractBlocks}
            >
                <TextBlocksProvider>
                    <GestureHandlerRootView>
                        <BlocksMeasuresProvider>
                            <ScrollProvider contentContainerStyle={contentContainerStyle}>
                                <RenderTree rootBlockId={rootBlockId} />
                            </ScrollProvider>
                        </BlocksMeasuresProvider>


                        <Footer.ContextProvider>
                            <Footer>
                                <Footer.AddBlock />
                                <Footer.TurnBlockInto />
                                <Footer.RemoveBlock />
                            </Footer>
                        </Footer.ContextProvider>
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}