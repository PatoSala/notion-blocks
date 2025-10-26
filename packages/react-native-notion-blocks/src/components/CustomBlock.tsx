// I might rename this to just Block 
interface CustomBlockProps {
    type: string;
    component: any;
}

const CustomBlock = (props: CustomBlockProps) => {
    const {
        type,
        component
    } = props;

    return null;
} 

export {
    CustomBlock,
    CustomBlockProps
}