import { createContext, useContext, useState, useRef, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBlocksContext } from "./BlocksContext";
import { useTextBlocksContext } from "./TextBlocksProvider";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";

interface ScrollContextProps {
    scrollY: SharedValue<number>;
    isScrolling: boolean;
    handleScrollTo: (params: { x?: number; y?: number; animated?: boolean; }) => void;
}

const ScrollContext = createContext({});

export const useScrollContext = () => useContext(ScrollContext);

export function ScrollProvider({ children }) {
    const { blockMeasuresRef } = useBlocksMeasuresContext();
    const { focusedBlockId } = useBlocksContext();
    const { inputRefs } = useTextBlocksContext();
    const { keyboardHeight } = useKeyboardStatus();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollY = useSharedValue(0);

    /* useEffect(() => {
        // Maybe this conditional could be a function "scrollToVisiblePosition" or sth like that
        if (blockMeasuresRef.current[focusedBlockId]?.start > keyboardHeight + 24) {
            handleScrollTo({
                x: 0,
                y: blockMeasuresRef.current[focusedBlockId]?.start - keyboardHeight,
                animated: true
            })
        }
    }, [focusedBlockId]); */
    
    const handleDragStart = () => {
        /* if (focusedBlockId) inputRefs.current["ghostInput"]?.current.focus(); */

        setIsScrolling(true);
    }

    const handleDragEnd = () => {
        /* if (focusedBlockId) {
            requestAnimationFrame(() => {
                inputRefs.current[focusedBlockId].current.focus();
            })
        }; */
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
                /* style={{ flex: 1 }} */
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top,
                    paddingHorizontal: 8,
                }}
                keyboardShouldPersistTaps="always"
                automaticallyAdjustKeyboardInsets
            >
                {children}

            </ScrollView>
        </ScrollContext.Provider>
    );
}