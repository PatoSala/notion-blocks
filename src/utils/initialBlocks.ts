import { Block as IBlock } from "../../interfaces/Block.interface";

export const blocksData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "Page"
        },
        content: ["2"],
        parent: ""
    },
    "2": {
        id: "2",
        type: "header",
        properties: {
            title: "Page"
        },
        content: [],
        parent: "1"
    }
}