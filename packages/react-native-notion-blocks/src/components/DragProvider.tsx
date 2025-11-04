import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from "react-native-reanimated";
import { Dimensions } from "react-native";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useBlocksContext } from "./Blocks/BlocksContext";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useScrollContext } from "./ScrollProvider";
import { useEffect } from "react";


const { height } = Dimensions.get("screen");
const TOP_THRESHOLD = 200;
const BOTTOM_THRESHOLD = height - 200;

export default function DragProvider({
    children,
    blockId,
}) {
    const { movingBlockId, setMovingBlockId, moveBlock, blocks } = useBlocksContext();
    const {
        setOffset,
        setIsDragging,
        indicatorPosition,
        setIndicatorPosition,
        blockMeasuresRef
    } = useBlocksMeasuresContext();
    const { scrollY } = useScrollContext();
    const scrollDirection = useSharedValue<null | "UP" | "DOWN">(null);

    /* while (scrollDirection.value !== null) {
        if (scrollDirection.value === "UP") {
            console.log("UP");
        }

        if (scrollDirection.value === "DOWN") {
            console.log("DOWN");
        }
    } */

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

    const handleOnDragUpdate = (e: GestureUpdateEvent, start: { x: number, y: number }) => {
        const x = e.translationX;
        const y = e.translationY;

        if (e.absoluteY > BOTTOM_THRESHOLD) {
            scrollDirection.value = "DOWN";
        } else if (e.absoluteY < TOP_THRESHOLD) {
            scrollDirection.value = "UP";
        } else {
            scrollDirection.value = null;
        }
        
        setOffset({
            x: e.translationX + start.x,
            y: e.translationY + start.y,
        });
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
        setOffset({ x: 0, y: 0 });
        setIndicatorPosition({ y: 0 });
    }

    // scroll, tap
    const nativeGestures = Gesture.Native()

    const start = useSharedValue({ x: 0, y: 0 });
    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .onBegin((e) => {
            start.value = {
                x: 0,
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
        });
    
    const composed = Gesture.Exclusive(blockDrag, nativeGestures);

    return (
        <GestureDetector gesture={composed}>
            {children}
        </GestureDetector>
    );
}