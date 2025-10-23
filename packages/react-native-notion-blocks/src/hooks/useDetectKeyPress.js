"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDetectKeyPress = useDetectKeyPress;
var react_1 = require("react");
function useDetectKeyPress(_a) {
    var key = _a.key, target = _a.target;
    var _b = (0, react_1.useState)(false), isPressed = _b[0], setIsPressed = _b[1];
    var handleKeyPress = function (_a) {
        var nativeEvent = _a.nativeEvent;
        if (nativeEvent.key === key) {
            setIsPressed(true);
            // Perform actions when Delete or Backspace is pressed
            console.log('Delete or Backspace key pressed!');
        }
        else {
            setIsPressed(false);
        }
    };
    return {
        isPressed: isPressed,
        handleKeyPress: handleKeyPress
    };
}
