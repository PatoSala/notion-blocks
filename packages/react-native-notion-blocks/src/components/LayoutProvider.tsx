import { useRef, useLayoutEffect, useEffect } from "react";
import { View } from "react-native";

/** Measures and registers the height and position of a block */
export default function LayoutProvider({
    children,
    blockId,
    registerBlockMeasure,
    dependancies
}) {
    const ref = useRef<View>(null);

    useLayoutEffect(() => {
        ref.current?.measure((x, y, width, height) => {
            registerBlockMeasure(blockId, {
                    blockId: blockId,
                    height: height,
                    start: y,
                    end: y + height
                });
        });
    }, [dependancies]);

    return (
        <View ref={ref}>
            {children}
        </View>
    );
}