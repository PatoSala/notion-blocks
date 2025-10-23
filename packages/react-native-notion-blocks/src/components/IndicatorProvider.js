"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndicatorProvider;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
function IndicatorProvider(_a) {
    var children = _a.children, position = _a.position;
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            transform: [
                { translateY: position.y }
            ],
        };
    });
    return (<>
            {children}
            <react_native_reanimated_1.default.View style={[
            styles.indicator,
            animatedStyles,
            {
                display: position.y === 0 ? "none" : "flex"
            }
        ]}/>
        </>);
}
var styles = react_native_1.StyleSheet.create({
    indicator: {
        height: 3,
        width: "100%",
        opacity: 0.5,
        backgroundColor: "#0277e4ff",
        position: "absolute"
    },
});
