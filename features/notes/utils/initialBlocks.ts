import { Block as IBlock } from "../../blocks/interfaces/Block.interface";

export const blocksData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "Hello World"
        },
        content: [],
        parent: ""
    }
}