import { useRef, useLayoutEffect, useContext, createContext, useEffect } from "react";
import { View } from "react-native";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useBlocksContext } from "./BlocksContext";

/** Measures and registers the height and position of a block */
export function LayoutProvider({
    children,
    blockId
}) {
    const { blocksOrder, rootBlockId } = useBlocksContext();
    const { registerBlockMeasure, removeBlockMeasure } = useBlocksMeasuresContext();
    const viewRef = useRef<View>(null);

    const handleOnLayout = () => {
        if (blockId !== rootBlockId) {
            viewRef.current?.measure((x, y, width, height) => {
                registerBlockMeasure(blockId, {
                    blockId: blockId,
                    height: height,
                    start: y,
                    end: y + height
                });
            });
        }
    }

    useEffect(() => {
        return () => {
            removeBlockMeasure(blockId);
        }
    }, [blocksOrder]);

    return (
        <View ref={viewRef} onLayout={handleOnLayout}>
            {children}
        </View>
    );
}