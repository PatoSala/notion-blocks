import { createContext, useContext, useState, useRef, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";

interface ScrollContextProps {
    scrollY: SharedValue<number>;
    isScrolling: boolean;
    handleScrollTo: (params: { x?: number; y?: number; animated?: boolean; }) => void;
}

const ScrollContext = createContext({});

export const useScrollContext = () => useContext(ScrollContext);

export function ScrollProvider({ children, contentContainerStyle }) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollY = useSharedValue(0);
    const { triggerRemeasure, blockMeasuresRef } = useBlocksMeasuresContext();

    const handleDragStart = () => {
        setIsScrolling(true);
    }

    const handleDragEnd = () => {
        setIsScrolling(false);
    }

    const handleOnScroll = (event: { nativeEvent: { contentOffset: { y: number; }; }; }) => {
        scrollY.value = Math.round(event.nativeEvent.contentOffset.y);
    };

    const handleScrollTo = ({ x, y, animated } : { x: number, y: number, animated: boolean }) => {
        scrollViewRef.current?.scrollTo({
            x: x,
            y: y,
            animated: animated
        });
    }

    // Used for measuring blocks after a rearrange 
    const handleOnContentSizeChange = () => {
        // NOTE: This triggerRemeasure is firing twice when app mounts.
        // Find a way to prevent it since blocks already measure themselves when onLayout.
        // This should only be fired when the app has already mounted.
        try {
            if (blockMeasuresRef.current) {
                console.log(blockMeasuresRef.current);
                triggerRemeasure();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const value = {
        scrollY,
        isScrolling,
        setIsScrolling,
        handleScrollTo
    }

    return (
        <ScrollContext.Provider value={value}>
            <ScrollView
                ref={scrollViewRef}
                onScroll={handleOnScroll}
                onScrollBeginDrag={handleDragStart}
                onScrollEndDrag={handleDragEnd}
                onMomentumScrollEnd={handleDragEnd}
                /* onContentSizeChange={handleOnContentSizeChange} */
                contentContainerStyle={{
                    flexGrow: 1,
                    /* paddingTop: insets.top, */
                    paddingHorizontal: 8,
                    ...contentContainerStyle
                }}
                keyboardShouldPersistTaps="always"
                automaticallyAdjustKeyboardInsets
            >
                {children}

            </ScrollView>
        </ScrollContext.Provider>
    );
}