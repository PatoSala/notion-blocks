"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Footer;
var react_1 = require("react");
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var useKeyboardStatus_1 = require("../../hooks/useKeyboardStatus");
var InsertBlockSection_1 = require("./tabs/InsertBlockSection");
var ReplaceBlockSection_1 = require("./tabs/ReplaceBlockSection");
function Footer(_a) {
    var style = _a.style, actions = _a.actions, setShowSoftInputOnFocus = _a.setShowSoftInputOnFocus, focusedBlockRef = _a.focusedBlockRef, focusedBlockId = _a.focusedBlockId, handleInsertBlock = _a.handleInsertBlock, handleTurnBlockInto = _a.handleTurnBlockInto;
    var _b = (0, useKeyboardStatus_1.useKeyboardStatus)(), isKeyboardOpen = _b.isKeyboardOpen, keyboardHeight = _b.keyboardHeight;
    var _c = (0, react_1.useState)("none"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = (0, react_1.useState)(true), hidden = _d[0], setHidden = _d[1];
    (0, react_1.useEffect)(function () {
        if (isKeyboardOpen) {
            setActiveTab("keyboard");
            setHidden(false);
        }
    }, [isKeyboardOpen]);
    var handleOpenKeyboard = function () {
        setActiveTab("keyboard");
        focusedBlockRef.current.focus();
        setShowSoftInputOnFocus(true);
    };
    var handleKeyboardDismiss = function () {
        react_native_1.Keyboard.dismiss();
        setShowSoftInputOnFocus(true);
        setActiveTab("none");
        setHidden(true);
    };
    return (<react_native_1.View style={{
            position: "absolute",
            bottom: hidden ? -keyboardHeight - 100 : 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "white"
        }}>
            <react_native_1.View style={[styles.container, style, {
                width: "100%",
            }]}>
                <react_native_1.FlatList horizontal contentContainerStyle={{
            flexGrow: 1
        }} keyboardShouldPersistTaps="always" data={actions} renderItem={function (_a) {
            var item = _a.item, index = _a.index;
            return (<react_native_1.Pressable key={index} onPress={function () {
                    setActiveTab(item.key);
                    item.onPress();
                }} style={function (_a) {
                    var pressed = _a.pressed;
                    return [
                        styles.button,
                        {
                            backgroundColor: activeTab === item.key ? "#f1f1f1" : "transparent",
                            opacity: pressed ? 0.5 : 1
                        }
                    ];
                }}>
                            {item.Icon}
                        </react_native_1.Pressable>);
        }} ListFooterComponent={function () { return (<>
                            <react_native_1.Pressable onPress={function () {
                if (activeTab !== "keyboard") {
                    handleOpenKeyboard();
                }
                else {
                    handleKeyboardDismiss();
                }
            }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.button,
                    {
                        opacity: pressed ? 0.5 : 1
                    }
                ];
            }}>
                                {activeTab !== "keyboard"
                ? (<vector_icons_1.Ionicons name="close-circle-outline" size={24} color="black"/>)
                : (<vector_icons_1.MaterialCommunityIcons name="keyboard-close-outline" size={24} color="black"/>)}
                            </react_native_1.Pressable>
                        </>); }}/>
            </react_native_1.View>

            {activeTab && (<react_native_1.View style={[styles.tabSectionContainer, { height: keyboardHeight }]}>
                    {activeTab === "add-block" ? <InsertBlockSection_1.default focusedBlockId={focusedBlockId} handleInsertBlock={handleInsertBlock}/> : null}
                    {activeTab === "turn-block-into" ? <ReplaceBlockSection_1.default focusedBlockId={focusedBlockId} handleTurnBlockInto={handleTurnBlockInto}/> : null}
                </react_native_1.View>)}
        </react_native_1.View>);
}
var styles = react_native_1.StyleSheet.create({
    container: {
        height: 44,
        flexDirection: "row",
        boxShadow: "0px -1px 0px rgba(0, 0, 0, 0.1)"
    },
    button: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    tabSectionContainer: {
        backgroundColor: "#f5f5f5",
        padding: 16,
    }
});
