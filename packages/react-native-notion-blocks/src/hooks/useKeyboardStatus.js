"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardStatus = useKeyboardStatus;
var react_1 = require("react");
var react_native_1 = require("react-native");
function useKeyboardStatus() {
    var _a = (0, react_1.useState)(false), isKeyboardOpen = _a[0], setIsKeyboardOpen = _a[1];
    var _b = (0, react_1.useState)(0), keyboardHeight = _b[0], setKeyboardHeight = _b[1];
    var _c = (0, react_1.useState)(0), keyboardY = _c[0], setKeyboardY = _c[1];
    (0, react_1.useEffect)(function () {
        var keyboardDidShowListener = react_native_1.Keyboard.addListener('keyboardDidShow', function (e) {
            setIsKeyboardOpen(true);
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardY(e.endCoordinates.screenY);
        });
        var keyboardDidHideListener = react_native_1.Keyboard.addListener('keyboardDidHide', function () {
            setIsKeyboardOpen(false);
        });
        return function () {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    return { isKeyboardOpen: isKeyboardOpen, keyboardHeight: keyboardHeight, keyboardY: keyboardY };
}
