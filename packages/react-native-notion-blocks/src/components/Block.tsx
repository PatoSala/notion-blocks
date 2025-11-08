interface BlockOptionsProps {
    [key: string]: any;
}

interface BlockProps {
    type: string;
    component: any;
    options?: BlockOptionsProps
}

const Block = (props: BlockProps) => {
    const {
        type,
        component,
        options
    } = props;
    
    return null;
} 

export {
    Block,
    BlockProps,
    BlockOptionsProps
}