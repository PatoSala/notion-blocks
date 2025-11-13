import { createContext, useContext, useRef, RefObject, useState, useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, SharedValue } from "react-native-reanimated";
import { useScrollContext } from "./ScrollProvider";
import { useBlocksContext } from "./BlocksContext";
import { useBlockRegistrationContext } from "./BlockRegistration";

const { width, height } = Dimensions.get("window");

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
    const { blockTypes } = useBlockRegistrationContext();
    const { movingBlockId, blocks } = useBlocksContext();
    const [shouldRemeasure, setShouldRemeasure] = useState(false);

    /* const triggerRemeasure = () => {
        setShouldRemeasure(true);
        setTimeout(() => {
            setShouldRemeasure(false);
        }, 100);
    } */

    /* const [ghostBlockStartingPosition, setGhostBlockStartingPosition] = useState({ x: 0, y: 0 }); */

    /* useEffect(() => {
        if (movingBlockId) {
            console.log(blockMeasuresRef.current[movingBlockId]);
            blockMeasuresRef.current[movingBlockId].ref.current?.measure((x, y, width, height, pageX, pageY) => {
                console.log(x, y, width, height, pageX, pageY);
                setGhostBlockStartingPosition({
                    x: pageX,
                    y: pageY
                })
            })
        }
    }, [movingBlockId]); */

    const registerBlockMeasure = (blockId: string, measures: { height: number, width: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
        console.log(blockMeasuresRef.current);
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
    /** NOTE: It might be better to separate this into its own provider. */
    const isDragging = useSharedValue(false);
    const offset = useSharedValue({ x: 0, y: 0 });

    /* const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
            ],
            display: isDragging.value === false ? 'none' : 'flex',
        };
    }); */

    /** 
     * NOTE: Ghost block only needs to look like the block that is being dragged,
     * but right now its mounting the whole component with all its logic, which is not necessary.
     * I'll leave it like this because its working, but it can be refactored in the future.
     */
    /* const GhostBlock = () => {
        const Component = blockTypes[blocks[movingBlockId].type].component;
        return (
            <Animated.View style={[{
                opacity: 0.5,
                position: "absolute",
                width: "100%",
            }, animatedStyles]}>
                <Component blockId={movingBlockId} />
            </Animated.View>
        )
    } */

    const values = {
        blockMeasuresRef,
        registerBlockMeasure,
        removeBlockMeasure,
        
        /* shouldRemeasure,
        triggerRemeasure, */

        // Ghost block
        isDragging,
        setIsDragging: (value: boolean) => isDragging.value = value,
        /* offset,
        setOffset: ({ x, y }) => offset.value = { x, y }, */

        // Move indicator
        indicatorPosition,
        setIndicatorPosition: ({ y }) => indicatorPosition.value = { y },
    };
    
    return (
        <BlocksMeasuresContext.Provider value={values}>
            {children}

            <Indicator />

            {/* <View style={{
                width: 50,
                height: 50,
                backgroundColor: "red",
                position: "absolute",
                left: 16,
                top: 142
            }}/> */}

            {/* {isDragging.value === true && movingBlockId && <GhostBlock />} */}
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