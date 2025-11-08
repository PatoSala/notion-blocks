import { useRef, useLayoutEffect, useEffect } from "react";
import { View } from "react-native";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useBlocksContext } from "./BlocksContext";

/** Measures and registers the height and position of a block */
export default function LayoutProvider({
    children,
    blockId
}) {
    const { blocksOrder, rootBlockId } = useBlocksContext();
    const { registerBlockMeasure, removeBlockMeasure } = useBlocksMeasuresContext();
    const ref = useRef<View>(null);

    useLayoutEffect(() => {
        if (blockId !== rootBlockId) {
            ref.current?.measure((x, y, width, height) => {
                registerBlockMeasure(blockId, {
                    blockId: blockId,
                    height: height,
                    start: y,
                    end: y + height
                });
            });
        }

        return () => {
            removeBlockMeasure(blockId);
        }
    }, [blocksOrder]);

    return (
        <View ref={ref}>
            {children}
        </View>
    );
}