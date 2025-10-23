"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NoteScreen;
var react_1 = require("react");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var sampleData_1 = require("../utils/sampleData");
var Block_interface_1 = require("../interfaces/Block.interface");
var Block_1 = require("./Blocks/Block");
var DragProvider_1 = require("./DragProvider");
var LayoutProvider_1 = require("./LayoutProvider");
var Footer_1 = require("./Footer/Footer");
var updateBlock_1 = require("../core/updateBlock");
// Temporary
var textBasedBlockTypes = ["text", "header", "sub_header", "sub_sub_header"];
var width = react_native_1.Dimensions.get("window").width;
function NoteScreen() {
    var _a;
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var scrollViewRef = (0, react_1.useRef)(null);
    var refs = (0, react_1.useRef)({}); // TextInputs refs
    var pageId = "1";
    var _b = (0, react_1.useState)(sampleData_1.sampleData), blocks = _b[0], setBlocks = _b[1];
    var rootBlock = blocks[pageId];
    var content = rootBlock.content;
    var _c = (0, react_1.useState)(null), focusedBlockId = _c[0], setFocusedBlockId = _c[1];
    var scrollY = (0, react_native_reanimated_1.useSharedValue)(0);
    var handleScroll = function (event) {
        scrollY.value = Math.round(event.nativeEvent.contentOffset.y);
    };
    var handleScrollTo = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, animated = _a.animated;
        (_b = scrollViewRef.current) === null || _b === void 0 ? void 0 : _b.scrollTo({
            x: x,
            y: y,
            animated: animated
        });
    };
    /** Editor configs */
    var _d = (0, react_1.useState)(true), showSoftInputOnFocus = _d[0], setShowSoftInputOnFocus = _d[1];
    var footerActions = [
        {
            key: "add-block",
            onPress: function () {
                setShowSoftInputOnFocus(false);
                react_native_1.Keyboard.dismiss();
                requestAnimationFrame(function () {
                    var _a;
                    (_a = refs.current[focusedBlockId]) === null || _a === void 0 ? void 0 : _a.current.focus();
                });
            },
            Icon: <vector_icons_1.Ionicons name="add-outline" size={24} color="black"/>
        },
        {
            key: "turn-block-into",
            onPress: function () {
                setShowSoftInputOnFocus(false);
                react_native_1.Keyboard.dismiss();
                requestAnimationFrame(function () {
                    var _a;
                    (_a = refs.current[focusedBlockId]) === null || _a === void 0 ? void 0 : _a.current.focus();
                });
            },
            Icon: <vector_icons_1.Ionicons name="repeat-outline" size={24} color="black"/>
        }
    ];
    /** Editor state actions */
    function registerRef(blockId, ref) {
        refs.current[blockId] = ref;
    }
    function unregisterRef(blockId) {
        delete refs.current[blockId];
    }
    /** Block actions */
    /**
     * Note: Currently the function below it's only insering into the root block.
     */
    function insertBlock(newBlock) {
        var _a;
        var updatedBlock = (0, updateBlock_1.updateBlock)(blocks[pageId], {
            content: (0, updateBlock_1.insertBlockIdIntoContent)(blocks[pageId].content, newBlock.id, {})
        });
        setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[pageId] = updatedBlock, _a[newBlock.id] = newBlock, _a)));
    }
    /**
     *
     * @param block
     * @param selection
     *
     * Split block into two blocks.
     * A new block will be inserted before the source block with the text before the cursor.
     * The source block will be updated with the text after the cursor.
     *
     * [Note: Review return statements]
     */
    function splitBlock(block, selection) {
        var _a, _b;
        var textBeforeSelection = block.properties.title.substring(0, selection.start);
        var textAfterSelection = block.properties.title.substring(selection.end);
        // If splitting root block, insert new text block below
        if (block.id === rootBlock.id) {
            var newBlockText = textAfterSelection;
            var newBlock = new Block_interface_1.Block({
                type: "text",
                properties: {
                    title: newBlockText
                },
                parent: block.id,
            });
            // Update parent block's content array (which is the current block in this case)
            var updatedParentBlock = (0, updateBlock_1.updateBlock)(block, {
                properties: {
                    title: textBeforeSelection
                },
                content: (0, updateBlock_1.insertBlockIdIntoContent)(block.content, newBlock.id, {
                    nextBlockId: block.content[0]
                })
            });
            setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[newBlock.id] = newBlock, _a[updatedParentBlock.id] = updatedParentBlock // source and parent block
            , _a)));
            /** Review */
            return {
                splitResult: newBlock,
                updatedBlock: updatedParentBlock
            };
        }
        else {
            var updatedBlock = (0, updateBlock_1.updateBlock)(block, {
                type: selection.start === 0 && selection.end === 0 ? block.type : "text",
                properties: {
                    title: textAfterSelection
                }
            });
            // Will be inserted before the source block, pushing the source block down
            var newBlock = new Block_interface_1.Block({
                type: selection.start === 0 && selection.end === 0 ? "text" : block.type,
                properties: {
                    title: textBeforeSelection
                },
                parent: block.parent,
            });
            var updatedParentBlock = (0, updateBlock_1.updateBlock)(blocks[block.parent], {
                content: (0, updateBlock_1.insertBlockIdIntoContent)(blocks[block.parent].content, newBlock.id, {
                    nextBlockId: block.id
                })
            });
            setBlocks(__assign(__assign({}, blocks), (_b = {}, _b[newBlock.id] = newBlock, _b[block.id] = updatedBlock, _b[block.parent] = updatedParentBlock // parent block
            , _b)));
            /** Review */
            return {
                splitResult: updatedBlock,
            };
        }
    }
    /**
     *
     * @param block
     * @returns
     *
     * Merge block with the block text before it.
     * Appends the text from the target block at the beginning of the source block.
     * The source block type will be replaced with the target block type.
     * Last of all, the target block is removed.
     */
    function mergeBlock(block) {
        var _a, _b;
        var sourceBlock = block;
        var parentBlock = blocks[sourceBlock.parent];
        var sourceBlockContentIndex = parentBlock.content.indexOf(sourceBlock.id);
        var isFirstChild = sourceBlockContentIndex === 0;
        var targetBlock = isFirstChild
            ? parentBlock
            : blocks[parentBlock.content[sourceBlockContentIndex - 1]]; // The block before the source block.
        var sourceBlockText = sourceBlock.properties.title;
        var targetBlockText = targetBlock.properties.title;
        // If the block to merge with is the parent block
        if (targetBlock.id === parentBlock.id) {
            /** Remove source block from parent's content array and update title property. */
            var updatedParentBlock = (0, updateBlock_1.updateBlock)(parentBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                },
                content: parentBlock.content.filter(function (id) { return id !== sourceBlock.id; })
            });
            /** Remove source block */
            var copyOfBlocks = blocks;
            delete copyOfBlocks[sourceBlock.id];
            setBlocks(__assign(__assign({}, copyOfBlocks), (_a = {}, _a[updatedParentBlock.id] = updatedParentBlock, _a)));
            return {
                prevTitle: sourceBlockText,
                newTitle: targetBlockText + sourceBlockText,
                mergeResult: updatedParentBlock
            };
        }
        else {
            /** Remove target block from parent's content array. */
            var updatedParentBlock = (0, updateBlock_1.updateBlock)(parentBlock, {
                content: parentBlock.content.filter(function (id) { return id !== targetBlock.id; })
            });
            /** Update source block  */
            var updatedSourceBlock = (0, updateBlock_1.updateBlock)(sourceBlock, {
                type: targetBlock.type,
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });
            /** Remove target block */
            var copyOfBlocks = blocks;
            delete copyOfBlocks[targetBlock.id];
            /** Update state with changes */
            setBlocks(__assign(__assign({}, copyOfBlocks), (_b = {}, _b[parentBlock.id] = updatedParentBlock, _b[updatedSourceBlock.id] = updatedSourceBlock, _b)));
            return {
                prevTitle: sourceBlockText,
                newTitle: updatedSourceBlock.properties.title,
                mergeResult: updatedSourceBlock
            };
        }
    }
    function removeBlock(blockId) {
        var _a;
        var block = blocks[blockId];
        var parentBlock = blocks[block.parent];
        var blocksState = blocks;
        delete blocksState[blockId];
        /** Update parent block's content array */
        var updatedParentBlock = (0, updateBlock_1.updateBlock)(parentBlock, {
            content: parentBlock.content.filter(function (id) { return id !== blockId; })
        });
        setBlocks(__assign(__assign({}, blocksState), (_a = {}, _a[updatedParentBlock.id] = updatedParentBlock, _a)));
    }
    function moveBlocks(blockId, parentId, targetId, closestTo) {
        var _a;
        var _b;
        var blockIndexInContent = (_b = blocks[parentId].content) === null || _b === void 0 ? void 0 : _b.indexOf(blockId);
        console.log("blockIndexInContent: ", blockIndexInContent);
        var parentContent = blocks[parentId].content;
        parentContent.splice(blockIndexInContent, 1);
        console.log(parentContent);
        var updatedBlock = (0, updateBlock_1.updateBlock)(blocks[parentId], {
            content: (0, updateBlock_1.insertBlockIdIntoContent)(parentContent, blockId, closestTo === "start" ? { nextBlockId: targetId } : { prevBlockId: targetId })
        });
        console.log(updatedBlock);
        setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[pageId] = updatedBlock, _a)));
    }
    /**
     * Note: Only text based blocks can be turned into other block types.
     */
    function turnBlockInto(blockId, blockType) {
        var _a;
        var updatedBlock = (0, updateBlock_1.updateBlock)(blocks[blockId], {
            type: blockType
        });
        setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[blockId] = updatedBlock, _a)));
        return updatedBlock;
    }
    /** Event handlers */
    function handleOnChangeText(blockId, text) {
        var _a;
        var updatedBlock = (0, updateBlock_1.updateBlock)(blocks[blockId], {
            properties: {
                title: text
            }
        });
        setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[blockId] = updatedBlock, _a)));
    }
    function handleOnKeyPress(event, block, selection) {
        if (block.id === pageId)
            return;
        /**
         * If block is not empty and cursor is at start, merge block with previous block.
         */
        if (event.nativeEvent.key === "Backspace" && (selection.start === 0 && selection.end === 0)) {
            // The following is like an "optimistic update", we set the block's content before update
            var sourceBlock = block;
            var parentBlock = blocks[sourceBlock.parent];
            var sourceBlockContentIndex = parentBlock.content.indexOf(sourceBlock.id);
            var isFirstChild = sourceBlockContentIndex === 0;
            var targetBlock = isFirstChild
                ? parentBlock
                : blocks[parentBlock.content[sourceBlockContentIndex - 1]];
            refs.current[sourceBlock.id].current.setText(targetBlock.properties.title + sourceBlock.properties.title);
            var _a = mergeBlock(block), prevTitle = _a.prevTitle, newTitle = _a.newTitle, mergeResult_1 = _a.mergeResult;
            // Focus previous block here
            var newCursorPosition_1 = newTitle.length - prevTitle.length;
            /* console.log("New cursor position: ", newCursorPosition); */
            requestAnimationFrame(function () {
                var _a;
                (_a = refs.current[mergeResult_1.id]) === null || _a === void 0 ? void 0 : _a.current.focusWithSelection({
                    start: newCursorPosition_1,
                    end: newCursorPosition_1
                });
            });
            return;
        }
    }
    var handleSubmitEditing = function (block, selection) {
        var _a;
        /** If block is text based or root block */
        if (textBasedBlockTypes.includes(block.type) || rootBlock.id === block.id) {
            var textBeforeSelection = block.properties.title.substring(0, selection.start);
            var textAfterSelection = block.properties.title.substring(selection.end);
            // The following is like an "optimistic update", we set the block's content before update
            (_a = refs.current[block.id]) === null || _a === void 0 ? void 0 : _a.current.focusWithSelection({
                start: 0,
                end: 0
            }, textAfterSelection);
            var splitResult_1 = splitBlock(block, selection).splitResult;
            requestAnimationFrame(function () {
                var _a;
                (_a = refs.current[splitResult_1.id]) === null || _a === void 0 ? void 0 : _a.current.focusWithSelection({
                    start: 0,
                    end: 0
                });
            });
            return;
        }
    };
    var handleNewLineBlock = function () {
        if (rootBlock.content.length === 0 || blocks[rootBlock.content[rootBlock.content.length - 1]].properties.title.length > 0) {
            var newBlock_1 = new Block_interface_1.Block({
                type: "text",
                properties: {
                    title: ""
                },
                content: [],
                parent: pageId
            });
            insertBlock(newBlock_1);
            // Focus new block
            requestAnimationFrame(function () {
                var _a;
                (_a = refs.current[newBlock_1.id]) === null || _a === void 0 ? void 0 : _a.current.focus();
            });
        }
        else {
            // Focus new block
            requestAnimationFrame(function () {
                var _a;
                (_a = refs.current[rootBlock.content[rootBlock.content.length - 1]]) === null || _a === void 0 ? void 0 : _a.current.focus();
            });
        }
    };
    /* Editor actions */
    var handleInsertNewBlock = function (prevBlockId, blockType) {
        var _a;
        var newBlock = new Block_interface_1.Block({
            type: blockType,
            properties: {
                title: ""
            },
            content: [],
            parent: pageId
        });
        // note: remember that the root block has no value for parent attribute.
        var parentBlock = blocks[prevBlockId].parent;
        var updateParentBlock = (0, updateBlock_1.updateBlock)(blocks[parentBlock], {
            content: (0, updateBlock_1.insertBlockIdIntoContent)(blocks[parentBlock].content, newBlock.id, {
                prevBlockId: prevBlockId
            })
        });
        setBlocks(__assign(__assign({}, blocks), (_a = {}, _a[updateParentBlock.id] = updateParentBlock, _a[newBlock.id] = newBlock, _a)));
        // Focus new block
        requestAnimationFrame(function () {
            var _a;
            (_a = refs.current[newBlock.id]) === null || _a === void 0 ? void 0 : _a.current.focus();
        });
    };
    var handleTurnBlockInto = function (blockId, blockType) {
        var updatedBlock = turnBlockInto(blockId, blockType);
        // Focus new block
        requestAnimationFrame(function () {
            var _a;
            (_a = refs.current[updatedBlock.id]) === null || _a === void 0 ? void 0 : _a.current.focus();
        });
    };
    var handleMoveBlock = function (blockId, position) {
        var blockIdAtPosition = findBlockAtPosition(position);
        console.log(blockIdAtPosition);
    };
    // Components
    var ListHeaderComponent = (0, react_1.useCallback)(function () { return (<Block_1.default key={pageId} blockId={pageId} block={rootBlock} title={rootBlock.properties.title} handleOnChangeText={handleOnChangeText} handleSubmitEditing={handleSubmitEditing} handleOnKeyPress={handleOnKeyPress} showSoftInputOnFocus={showSoftInputOnFocus} registerRef={registerRef} handleScrollTo={handleScrollTo} unregisterRef={unregisterRef} onFocus={function () {
            setFocusedBlockId(rootBlock.id);
        }}/>); }, [rootBlock]); // dependency array set in rootBlock.properties.title was causing the RNB-14 bug.
    var ListFooterComponent = function () { return (<react_native_1.Pressable onPress={handleNewLineBlock} style={{
            flexGrow: 1,
            height: "100%"
        }}/>); };
    // Ghost block
    var isPressed = (0, react_native_reanimated_1.useSharedValue)(false);
    var offset = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    var _e = (0, react_1.useState)(null), ghostBlockId = _e[0], setGhostBlockId = _e[1];
    var setIsPressed = function (value) { return isPressed.value = value; };
    var setOffset = function (value) { return offset.value = value; };
    var start = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    var setStart = function (value) { return start.value = value; };
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            transform: [
                { translateX: offset.value.x },
                /* { translateY: offset.value.y }, */
            ],
            top: offset.value.y,
            display: isPressed.value === false ? 'none' : 'flex',
            borderWidth: isPressed.value === true ? 1 : 0,
            borderRadius: 5
        };
    });
    var GhostBlock = function () { return (<react_native_reanimated_1.default.View style={[{
                opacity: 0.5,
                position: "absolute",
                width: "100%"
            }, animatedStyles]}>
            <Block_1.default blockId={ghostBlockId} block={blocks[ghostBlockId]} title={blocks[ghostBlockId].properties.title}/>
        </react_native_reanimated_1.default.View>); };
    // Block measures
    var blockMeasuresRef = (0, react_1.useRef)({});
    var indicatorPosition = (0, react_native_reanimated_1.useSharedValue)({ y: 0 });
    var registerBlockMeasure = function (blockId, measures) {
        blockMeasuresRef.current[blockId] = measures;
    };
    var setIndicatorPosition = function (value) { return indicatorPosition.value = value; };
    var findBlockAtPosition = function (y) {
        var withScrollY = y + scrollY.value;
        for (var blockId in blockMeasuresRef.current) {
            var _a = blockMeasuresRef.current[blockId], start_1 = _a.start, end = _a.end;
            if (withScrollY >= start_1 && withScrollY <= end) {
                var closestTo = withScrollY - start_1 > end - withScrollY ? "end" : "start";
                return {
                    blockId: blockId,
                    closestTo: closestTo
                };
            }
        }
    };
    var functionDetermineIndicatorPosition = function (y) {
        var withScrollY = y + scrollY.value;
        for (var blockId in blockMeasuresRef.current) {
            var _a = blockMeasuresRef.current[blockId], start_2 = _a.start, end = _a.end;
            if (withScrollY >= start_2 && withScrollY <= end) {
                var closestTo = withScrollY - start_2 > end - withScrollY ? "end" : "start";
                indicatorPosition.value = {
                    y: blockMeasuresRef.current[blockId][closestTo]
                };
            }
        }
    };
    var triggerMoveBlock = function () {
        if (!ghostBlockId)
            return;
        var blockToMove = blocks[ghostBlockId];
        var targetBlock = findBlockAtPosition(indicatorPosition.value.y); // Passing the indicator position fixes de out of bounds error since the indicator value will always be positioned at the start ot end of a block
        moveBlocks(blockToMove.id, blockToMove.parent, targetBlock.blockId, targetBlock.closestTo);
        // re measure blocks
    };
    var indicatorAnimatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            top: indicatorPosition.value.y
        };
    });
    var Indicator = function () { return (<react_native_reanimated_1.default.View style={[
            styles.indicator,
            indicatorAnimatedStyles,
            {
                display: indicatorPosition.value.y === 0 ? "none" : "flex"
            }
        ]}/>); };
    return (<react_native_gesture_handler_1.GestureHandlerRootView>
            <react_native_1.KeyboardAvoidingView style={styles.container} behavior={"padding"}>
                    <react_native_1.ScrollView ref={scrollViewRef} onScroll={handleScroll} contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top,
            paddingHorizontal: 8,
        }} 
    /* scrollEnabled={false} */
    keyboardShouldPersistTaps="always" automaticallyAdjustKeyboardInsets>
                        <Indicator />

                        <ListHeaderComponent />

                        {(_a = rootBlock.content) === null || _a === void 0 ? void 0 : _a.map(function (blockId) {
            return (<LayoutProvider_1.default key={blockId} blockId={blockId} registerBlockMeasure={registerBlockMeasure} dependancies={blocks[pageId]}>
                                    <DragProvider_1.default block={blocks[blockId]} scrollViewRef={scrollViewRef} handleScrollTo={handleScrollTo} scrollPosition={scrollY} setIsPressed={setIsPressed} setGhostBlockId={setGhostBlockId} offset={offset} setOffset={setOffset} start={start} setStart={setStart} functionDetermineIndicatorPosition={functionDetermineIndicatorPosition} setIndicatorPosition={setIndicatorPosition} triggerMoveBlock={triggerMoveBlock}>
                                        <react_native_1.View>
                                            <Block_1.default blockId={blockId} block={blocks[blockId]} title={blocks[blockId].properties.title} handleOnChangeText={handleOnChangeText} handleSubmitEditing={handleSubmitEditing} handleOnKeyPress={handleOnKeyPress} showSoftInputOnFocus={showSoftInputOnFocus} registerRef={registerRef} unregisterRef={unregisterRef} handleScrollTo={handleScrollTo} scrollViewRef={scrollViewRef} onFocus={function () {
                    setFocusedBlockId(blockId);
                }}/>
                                        </react_native_1.View>
                                    </DragProvider_1.default>
                                </LayoutProvider_1.default>);
        })}

                        <ListFooterComponent />

                    </react_native_1.ScrollView>
                {isPressed.value === true && <GhostBlock />}

                <Footer_1.default actions={footerActions} setShowSoftInputOnFocus={setShowSoftInputOnFocus} focusedBlockRef={refs.current[focusedBlockId]} focusedBlockId={focusedBlockId} handleInsertBlock={handleInsertNewBlock} handleTurnBlockInto={handleTurnBlockInto}/>
            </react_native_1.KeyboardAvoidingView>
        </react_native_gesture_handler_1.GestureHandlerRootView>);
}
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 8
    },
    blockOptionsContainer: {
        backgroundColor: "#f5f5f5",
        padding: 16
    },
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        minWidth: "50%",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)"
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    indicator: {
        height: 3,
        width: width - 32,
        marginLeft: 16,
        boxSizing: "border-box",
        opacity: 0.5,
        backgroundColor: "#0277e4ff",
        position: "absolute"
    }
});
