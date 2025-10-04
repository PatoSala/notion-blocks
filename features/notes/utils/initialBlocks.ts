import { Block as IBlock } from "../../blocks/interfaces/Block.interface";

export const blocksData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "Hello World 0 "
        },
        content: ["2", "3"],
        parent: ""
    },
    "2": {
        id: "2",
        type: "text",
        properties: {
            title: "Hello World 1"
        },
        content: [],
        parent: ""
    },
    "3": {
        id: "3",
        type: "text",
        properties: {
            title: "Hello World 2"
        },
        content: [],
        parent: ""
    }
}