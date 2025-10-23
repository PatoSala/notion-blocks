"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LayoutProvider;
var react_1 = require("react");
var react_native_1 = require("react-native");
/** Measures and registers the height and position of a block */
function LayoutProvider(_a) {
    var children = _a.children, blockId = _a.blockId, registerBlockMeasure = _a.registerBlockMeasure, dependancies = _a.dependancies;
    var ref = (0, react_1.useRef)(null);
    (0, react_1.useLayoutEffect)(function () {
        var _a;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.measure(function (x, y, width, height) {
            registerBlockMeasure(blockId, {
                blockId: blockId,
                height: height,
                start: y,
                end: y + height
            });
        });
    }, [dependancies]);
    return (<react_native_1.View ref={ref}>
            {children}
        </react_native_1.View>);
}
