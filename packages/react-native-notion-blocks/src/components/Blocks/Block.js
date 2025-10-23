"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var updateBlock_1 = require("../../core/updateBlock");
var useKeyboardStatus_1 = require("../../hooks/useKeyboardStatus");
var width = react_native_1.Dimensions.get("window").width;
var BlockElement = (0, react_1.memo)(function (_a) {
    var blockId = _a.blockId, block = _a.block, title = _a.title, handleOnBlur = _a.handleOnBlur, onFocus = _a.onFocus, onLongPress = _a.onLongPress, onPress = _a.onPress, editable = _a.editable, onPressOut = _a.onPressOut, scrollViewRef = _a.scrollViewRef, handleSubmitEditing = _a.handleSubmitEditing, handleOnChangeText = _a.handleOnChangeText, handleOnKeyPress = _a.handleOnKeyPress, registerRef = _a.registerRef, unregisterRef = _a.unregisterRef, showSoftInputOnFocus = _a.showSoftInputOnFocus, handleScrollTo = _a.handleScrollTo;
    if (block === undefined) {
        /** Setting this to null might be a good hotfix. */
        return <react_native_1.Text>Block not found. Id: {blockId}</react_native_1.Text>;
    }
    var ref = (0, react_1.useRef)(null);
    var viewRef = (0, react_1.useRef)(null);
    var selectionRef = (0, react_1.useRef)({ start: block.properties.title.length, end: block.properties.title.length });
    var valueRef = (0, react_1.useRef)(title);
    var _b = (0, useKeyboardStatus_1.useKeyboardStatus)(), keyboardY = _b.keyboardY, keyboardHeight = _b.keyboardHeight;
    var api = {
        current: {
            setText: function (text) {
                var _a;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setNativeProps({ text: text });
                valueRef.current = text;
            },
            focus: function () {
                var _a;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus();
            },
            focusWithSelection: function (selection, text) {
                var _a, _b;
                /** Find a better way to sync value on block update */
                if (text !== undefined) {
                    requestAnimationFrame(function () {
                        var _a;
                        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setNativeProps({ text: text });
                        valueRef.current = text;
                    });
                }
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setSelection(selection.start, selection.end); // Sync native input with selection state
                selectionRef.current = selection;
                (_b = ref.current) === null || _b === void 0 ? void 0 : _b.focus();
            },
            getPosition: function () {
                var _a;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
                    console.log(x, y, width, height);
                });
            },
            measureLayout: function () {
                var _a;
                (_a = viewRef.current) === null || _a === void 0 ? void 0 : _a.measure(function (x, y, width, height) {
                    console.log(x, y, width, height);
                });
            }
        }
    };
    /* useLayoutEffect(() => {
       // Measure block layout
       if (scrollViewRef?.current !== null && viewRef.current !== null) {
           api.current.measureLayout(scrollViewRef);
       }
    }, []); */
    (0, react_1.useEffect)(function () {
        requestAnimationFrame(function () {
            api.current.setText(title);
            /* api.current.measureLayout(); */
        });
        /* if (scrollViewRef?.current !== null && viewRef.current !== null) {
           api.current.measureLayout(scrollViewRef);
       } */
    }, [title]);
    (0, react_1.useEffect)(function () {
        // Register ref on block mount. This will allow us to set focus/selection from the parent.
        registerRef && registerRef(blockId, api);
        return function () {
            unregisterRef && unregisterRef(blockId);
        };
    }, []);
    return (<>
            <react_native_1.View style={[styles.container]} ref={viewRef}>
                <react_native_1.TextInput ref={ref} scrollEnabled={false} style={[styles[block.type], {
                textAlignVertical: "top",
                flexShrink: 0,
                flexGrow: 1,
            }]} multiline 
    /* onLayout={() => scrollViewRef?.current !== null && api.current.measureLayout(scrollViewRef)}
    cursorColor={"black"} */
    selectionColor={"black"} submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
     onChangeText={function (text) {
            valueRef.current = text;
        }} onSelectionChange={function (_a) {
            var nativeEvent = _a.nativeEvent;
            selectionRef.current = nativeEvent.selection;
        }} showSoftInputOnFocus={showSoftInputOnFocus} smartInsertDelete={false} onFocus={onFocus} defaultValue={valueRef.current} selectTextOnFocus={false} onBlur={function () { return handleOnChangeText && handleOnChangeText(blockId, valueRef.current); }} onSubmitEditing={function () {
            handleSubmitEditing && handleSubmitEditing((0, updateBlock_1.updateBlock)(block, {
                properties: {
                    title: valueRef.current
                }
            }), selectionRef.current);
        }} onKeyPress={function (event) {
            var _a;
            event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0 ? handleOnKeyPress && handleOnKeyPress(event, (0, updateBlock_1.updateBlock)(block, {
                properties: {
                    title: valueRef.current
                }
            }), selectionRef.current) : null;
            // Get coordinates of the block. If coordinates are under the keyboard, scroll up.
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
                if (y > keyboardY) {
                    handleScrollTo && handleScrollTo({
                        x: 0,
                        y: y - 44,
                        animated: true
                    });
                }
            });
        }}/>
            </react_native_1.View>
        </>);
});
exports.default = BlockElement;
var styles = react_native_1.StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    page: {
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 36,
        minHeight: 36,
        marginTop: 36,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        marginVertical: 6,
        lineHeight: 24,
        minHeight: 24,
        flexWrap: "wrap"
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        minHeight: 34,
        flexWrap: "wrap"
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        marginTop: 24,
        marginBottom: 4,
        lineHeight: 30,
        minHeight: 30,
        flexWrap: "wrap"
    },
    sub_sub_header: {
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 20,
        marginBottom: 4,
        lineHeight: 26,
        minHeight: 26,
        flexWrap: "wrap"
    }
});
