"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DragProvider;
var react_native_1 = require("react-native");
var react_native_worklets_1 = require("react-native-worklets");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var height = react_native_1.Dimensions.get("window").height;
var TOP_THRESHOLD = 200; // Adjust as needed
var BOTTOM_THRESHOLD = 200;
function DragProvider(_a) {
    var children = _a.children, block = _a.block, handleScrollTo = _a.handleScrollTo, scrollPosition = _a.scrollPosition, scrollViewRef = _a.scrollViewRef, setGhostBlockId = _a.setGhostBlockId, setIsPressed = _a.setIsPressed, offset = _a.offset, setOffset = _a.setOffset, start = _a.start, setStart = _a.setStart, functionDetermineIndicatorPosition = _a.functionDetermineIndicatorPosition, setIndicatorPosition = _a.setIndicatorPosition, triggerMoveBlock = _a.triggerMoveBlock;
    // scroll, tap
    var nativeGestures = react_native_gesture_handler_1.Gesture.Native();
    /* const start = useSharedValue({ x: 0, y: 0 }); */
    var blockDrag = react_native_gesture_handler_1.Gesture.Pan()
        .activateAfterLongPress(1000)
        .onBegin(function (e) {
        (0, react_native_worklets_1.scheduleOnRN)(setStart, {
            x: 0,
            y: e.absoluteY
        });
    })
        .onStart(function (e) {
        (0, react_native_worklets_1.scheduleOnRN)(setIsPressed, true);
        (0, react_native_worklets_1.scheduleOnRN)(setGhostBlockId, block.id);
    })
        .onUpdate(function (e) {
        (0, react_native_worklets_1.scheduleOnRN)(setOffset, {
            x: e.translationX + start.value.x,
            y: e.translationY + start.value.y,
        });
        (0, react_native_worklets_1.scheduleOnRN)(functionDetermineIndicatorPosition, e.absoluteY);
        // Handle auto-scrolling
        /* if (e.absoluteY < TOP_THRESHOLD && scrollPosition.value > 0) {
            scheduleOnRN(handleScrollTo, {
                x: 0,
                y: scrollPosition.value - 150,
                animated: true,
            });
        }

        if (e.absoluteY > height - BOTTOM_THRESHOLD) {
            scheduleOnRN(handleScrollTo, {
                x: 0,
                y: scrollPosition.value + 200,
                animated: true,
            });
        } */
    })
        .onEnd(function () {
        /* scheduleOnRN(setStart, {
            x: offset.value.x,
            y: offset.value.y
        }); */
    })
        .onFinalize(function () {
        (0, react_native_worklets_1.scheduleOnRN)(setIsPressed, false);
        (0, react_native_worklets_1.scheduleOnRN)(triggerMoveBlock);
        (0, react_native_worklets_1.scheduleOnRN)(setGhostBlockId, null);
        (0, react_native_worklets_1.scheduleOnRN)(setStart, { x: 0, y: 0 });
        (0, react_native_worklets_1.scheduleOnRN)(setOffset, { x: 0, y: 0 });
        (0, react_native_worklets_1.scheduleOnRN)(setIndicatorPosition, { y: 0 });
    });
    var composed = react_native_gesture_handler_1.Gesture.Exclusive(blockDrag, nativeGestures);
    return (<react_native_gesture_handler_1.GestureDetector gesture={composed}>
                {children}
        </react_native_gesture_handler_1.GestureDetector>);
}
