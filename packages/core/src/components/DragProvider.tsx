import {
    useSharedValue,
    useAnimatedReaction,
} from "react-native-reanimated";
import { Dimensions, View } from "react-native";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useBlocksContext } from "./BlocksContext";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useScrollContext } from "./ScrollProvider";
import { useRef } from "react";

import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useBlockRegistrationContext } from "./BlockRegistration";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

// SCROLLING THRESHOLDS
const TOP_THRESHOLD = 100;
const BOTTOM_THRESHOLD = screenHeight - 100;

export default function DragProvider({
    children,
    blockId,
}) {
    const { blockTypes } = useBlockRegistrationContext();
    // End testing
    const {
        movingBlockId,
        setMovingBlockId,
        moveBlock,
        blocks,
        setSelectedBlockId,
        rootBlockId
    } = useBlocksContext();
    const {
        /* setOffset, */
        isDragging,
        setIsDragging,
        indicatorPosition,
        setIndicatorPosition,
        blockMeasuresRef
    } = useBlocksMeasuresContext();
    const { scrollY, handleScrollTo } = useScrollContext();

    const scrollDirection = useSharedValue<null | "UP" | "DOWN">(null);
    

    /** Auto scroll interval */
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    /** Gently scroll the view up */
    const scrollUp = () => {
        handleScrollTo({ y: scrollY.value - 200, animated: true });
    };

    /** Gently scroll the view down */
    const scrollDown = () => {
        handleScrollTo({ y: scrollY.value + 200, animated: true });
    };

    /** Start continuous scrolling */
    const startAutoScrollUp = () => {
        if (intervalRef.current) return; // already scrolling
        intervalRef.current = setInterval(scrollUp, 100); // gentle, continuous scroll
    };

    /** Stop scrolling */
    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            scrollDirection.value = null;
        }
    };

    const startAutoScrollDown = () => {
        if (intervalRef.current) return; // already scrolling
        intervalRef.current = setInterval(scrollDown, 100); // gentle, continuous scroll
    };

    useAnimatedReaction(
        () => {
            return {
                scrollDirection: scrollDirection.value,
                isDragging: isDragging.value
            }
        },
        (currentValue) => {
            if (currentValue.scrollDirection === "UP") {
                scheduleOnRN(startAutoScrollUp);
            }

            if (currentValue.scrollDirection === "DOWN") {
                scheduleOnRN(startAutoScrollDown);
            }

            if (currentValue.scrollDirection === null) {
                scheduleOnRN(stopAutoScroll);
            }

            if (currentValue.isDragging === false) {
                scheduleOnRN(stopAutoScroll);
            }
            
        }
    );

    /**
     *  Given a y coordinate, returns the block at that position and a "start" or "end"
     *  string that indicates if the position is closer to the start or end of the block
     * */

    const findBlockAtPosition = (y: number) : { blockId: string, closestTo: "start" | "end" } => {
        const withScrollY = y + scrollY.value;

        for (const blockId in blockMeasuresRef.current) {
            const { start, end } = blockMeasuresRef.current[blockId];
            if (withScrollY >= start && withScrollY <= end) {
                const closestTo = withScrollY - start > end - withScrollY ? "end" : "start";

                return {
                    blockId,
                    closestTo
                };
            }
        }

        return {
            blockId: null,
            closestTo: null
        };
    }

    const handleMoveBlock = () => {
        if (!movingBlockId) return;

        const blockToMove = blocks[movingBlockId];
        const targetBlock = findBlockAtPosition(indicatorPosition.value.y); // Passing the indicator position fixes de out of bounds error since the indicator value will always be positioned at the start ot end of a block
        
        moveBlock(blockToMove.id, blockToMove.parent, targetBlock.blockId, targetBlock.closestTo);
    }

    const handleOnDragStart = () => {
        setIsDragging(true);
        setMovingBlockId(blockId);
    }

    const handleOnDragUpdate = (e: GestureUpdateEvent/* , start: { x: number, y: number } */) => {

        /** Update scroll direction */
        if (e.absoluteY > BOTTOM_THRESHOLD) {
            scrollDirection.value = "DOWN";
        } else if (e.absoluteY < TOP_THRESHOLD) {
            scrollDirection.value = "UP";
        } else {
             scrollDirection.value = null;
        }

        /** translationX/Y equals how much the finger has moved from its starting point (offset) */
        // Should rename this to sth like "ghostBlockPosition"
        /* setOffset({
            x: e.absoluteX,
            y: e.absoluteY,
        }); */


        offset.value = {
            x: e.x,
            y: e.y
        };

        /** Update indicator position */
        const { blockId, closestTo } = findBlockAtPosition(e.absoluteY);

        if (blockId) {
            /**
             * Since block measures when taken are relative to the scrollY = 0,
             *  we need to substract it to make sure the indicator is positioned correctly.
             */
            setIndicatorPosition({
                y: blockMeasuresRef.current[blockId][closestTo] - scrollY.value    // We need to substract the scrollY to make sure 
            });
        }
    }

    const handleOnDragEnd = () => {
        handleMoveBlock();
        setIsDragging(false);
        setMovingBlockId(null);
        /* setOffset({ x: 0, y: 0 }); */
        offset.value = { x: 0, y: 0 };
        setIndicatorPosition({ y: 0 });
    }
    const start = useSharedValue({ x: 0, y: 0 });

    // scroll, tap
    const nativeGestures = Gesture.Native()

   const longPress = Gesture.LongPress()
        .minDuration(2000)
        .onStart((e) => {
            scheduleOnRN(setSelectedBlockId, blockId);
        })
        .enabled(blockId !== rootBlockId);

    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .minDistance(50)
        .onBegin((e) => {
            // e.absoluteX / e.absoluteY equals the position of the finger
            start.value = {
                x: e.absoluteX,
                y: e.absoluteY
            }

        })
        .onStart((e) => {
            scheduleOnRN(handleOnDragStart);
        })
        .onUpdate((e) => {
            scheduleOnRN(handleOnDragUpdate, e, start.value);
        })
        .onFinalize(() => {
            start.value = { x: 0, y: 0 };
            scheduleOnRN(handleOnDragEnd);
        })
        .blocksExternalGesture(nativeGestures)
        .enabled(blockId !== rootBlockId)
    
    const composed = Gesture.Simultaneous(nativeGestures, longPress, blockDrag);

    // Testing

    const blockWidth = movingBlockId ? blockMeasuresRef.current[movingBlockId].width : 0;
    const blockHeight = movingBlockId ? blockMeasuresRef.current[movingBlockId].height : 0;
    // Ghost block
        /** NOTE: It might be better to separate this into its own provider. */
        /* const isDragging = useSharedValue(false); */
        const offset = useSharedValue({ x: 0, y: 0 });
        const animatedStyles = useAnimatedStyle(() => {
            return {
                transform: [
                    { translateX: offset.value.x - blockWidth / 2 },
                    { translateY: offset.value.y - blockHeight / 2 },
                ],
                display: isDragging.value === false ? 'none' : 'flex',
            };
        });
        /** 
         * NOTE: Ghost block only needs to look like the block that is being dragged,
         * but right now its mounting the whole component with all its logic, which is not necessary.
         * I'll leave it like this because its working, but it can be refactored in the future.
         */
        const GhostBlock = () => {
            const Component = blockTypes[blocks[movingBlockId].type].component;

            return (
                <Animated.View style={[{
                    opacity: 0.5,
                    position: "absolute",
                    zIndex: 1000,
                    width: "100%",
                }, animatedStyles]}>
                    <Component blockId={movingBlockId} />
                </Animated.View>
            )
        }

    return (
        <GestureDetector gesture={composed}>
            <View>
                {children}

                {isDragging.value === true && movingBlockId === blockId && <GhostBlock />}
            </View>
        </GestureDetector>
    );
}