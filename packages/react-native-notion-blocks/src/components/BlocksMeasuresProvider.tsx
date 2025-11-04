import { createContext, useContext, useRef, RefObject } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, SharedValue } from "react-native-reanimated";
import { useScrollContext } from "./ScrollProvider";
import { useBlocksContext } from "./Blocks/BlocksContext";
import { useBlockRegistrationContext } from "./BlockRegistration";

const { width } = Dimensions.get("window");

interface BlockMeasuresContext {
    blockMeasuresRef: RefObject<Record<string, { height: number, start: number, end: number }>>;
    registerBlockMeasure: (blockId: string, measures: { height: number, start: number, end: number }) => void;
    removeBlockMeasure: (blockId: string) => void;
    
    indicatorPosition: SharedValue<{ y: number }>;
    setIndicatorPosition: (position: { y: number }) => void;

    isDragging: SharedValue<boolean>;
    setIsDragging: (isDragging: boolean) => void;
    offset: SharedValue<{ x: number, y: number }>;
    setOffset: (offset: { x: number, y: number }) => void;
}

const BlocksMeasuresContext = createContext<BlockMeasuresContext | null>(null);

export function useBlocksMeasuresContext() {
    const context = useContext(BlocksMeasuresContext);
    if (context === null) {
        throw new Error("useBlocksMeasuresContext must be used within a BlocksMeasuresProvider");
    }
    return context;
}

/**
 * Provider for block measures.
 * (Maybe good for refactoring): It also handles the animations for both the indicator and the ghost block when moving a block.
 */
export function BlocksMeasuresProvider({ children }) {
    const blockMeasuresRef = useRef({});
    const indicatorPosition = useSharedValue({ y: 0 });
    const { blocks: blockTypes } = useBlockRegistrationContext();
    const { movingBlockId, blocks } = useBlocksContext();

    const registerBlockMeasure = (blockId: string, measures: { height: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
    }

    const removeBlockMeasure = (blockId: string) => {
        delete blockMeasuresRef.current[blockId];
    }

    const indicatorAnimatedStyles = useAnimatedStyle(() => {
        return {
            top: indicatorPosition.value.y
        }
    });

    const Indicator = () => (
        <Animated.View style={[
            styles.indicator,
            indicatorAnimatedStyles,
            {
                display: indicatorPosition.value.y === 0 ? "none" : "flex"
            }
        ]} />
    )

    // Ghost block
    const isDragging = useSharedValue(false);
    const offset = useSharedValue({ x: 0, y: 0 });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: -24 },
            ],
            top: offset.value.y,
            display: isDragging.value === false ? 'none' : 'flex',
        };
    });

    const GhostBlock = () => {
        const Component = blockTypes[blocks[movingBlockId].type];
        return (
            <Animated.View style={[{
                opacity: 0.5,
                position: "absolute",
                width: "100%"
            }, animatedStyles]}>
                <Component blockId={movingBlockId} />
            </Animated.View>
        )
    }

    const values = {
        blockMeasuresRef,
        registerBlockMeasure,
        removeBlockMeasure,

        // Ghost block
        isDragging,
        setIsDragging: (value: boolean) => isDragging.value = value,
        offset,
        setOffset: ({ x, y }) => offset.value = { x, y },

        // Move indicator
        indicatorPosition,
        setIndicatorPosition: ({ y }) => indicatorPosition.value = { y },
    };
    
    return (
        <BlocksMeasuresContext.Provider value={values}>
            {children}

            <Indicator />

            {isDragging.value === true && movingBlockId && <GhostBlock />}
        </BlocksMeasuresContext.Provider>
    );
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