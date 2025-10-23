"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsertBlockSection;
var react_native_1 = require("react-native");
var width = react_native_1.Dimensions.get("window").width;
function InsertBlockSection(_a) {
    var focusedBlockId = _a.focusedBlockId, handleInsertBlock = _a.handleInsertBlock;
    return (<>
            <react_native_1.View style={styles.blockOptionsRow}>
                <react_native_1.Text>Blocks</react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.blockOptionsRow}>
                <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions]);
        }} onPress={function () { return handleInsertBlock(focusedBlockId, "text"); }}>
                    <react_native_1.Text>Text</react_native_1.Text>
                </react_native_1.Pressable>

                <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions]);
        }} onPress={function () { return handleInsertBlock(focusedBlockId, "header"); }}>
                    <react_native_1.Text>Heading 1</react_native_1.Text>
                </react_native_1.Pressable>
            </react_native_1.View>

            <react_native_1.View style={styles.blockOptionsRow}>
                <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions]);
        }} onPress={function () { return handleInsertBlock(focusedBlockId, "sub_header"); }}>
                    <react_native_1.Text>Heading 2</react_native_1.Text>
                </react_native_1.Pressable>

                <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions]);
        }} onPress={function () { return handleInsertBlock(focusedBlockId, "sub_sub_header"); }}>
                    <react_native_1.Text>Heading 3</react_native_1.Text>
                </react_native_1.Pressable>
            </react_native_1.View>
        </>);
}
var styles = react_native_1.StyleSheet.create({
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
        gap: 4
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        width: width / 2 - 20,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)",
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "bold",
    }
});
