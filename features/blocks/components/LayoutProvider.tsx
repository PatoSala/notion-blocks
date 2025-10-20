import { useRef, useLayoutEffect, use } from "react";
import { View } from "react-native";

export default function LayoutProvider({ children, blockId }) {
    const ref = useRef<View>(null);

    useLayoutEffect(() => {
        ref.current?.measure((x, y, width, height) => {
            const measures = `
                Block: ${blockId}
                height: ${height}
                start-y: ${y}
                end-y: ${y + height}
            `;
            console.log(measures);
        });
    }, []);

    return (
        <View ref={ref}>
            {children}
        </View>
    );
}