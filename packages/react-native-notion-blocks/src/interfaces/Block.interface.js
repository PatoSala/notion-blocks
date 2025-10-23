"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
var Crypto = require("expo-crypto");
var Block = /** @class */ (function () {
    function Block(_a) {
        var type = _a.type, properties = _a.properties, _b = _a.content, content = _b === void 0 ? [] : _b, parent = _a.parent;
        this.id = Crypto.randomUUID();
        ;
        this.type = type;
        this.properties = properties;
        this.content = content;
        this.parent = parent;
    }
    return Block;
}());
exports.Block = Block;
// Blocks already handle structure, maybe the storage should only be responsible for storing all blocks
