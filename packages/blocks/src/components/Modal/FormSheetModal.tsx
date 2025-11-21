import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
    title: string;
    onClose: () => void;
    visible: boolean;
    children: React.ReactNode;
}

export default function FormSheetModal(props: Props) {
    const {
        title,
        onClose,
        visible,
        children
    } = props;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            backdropColor={"#f0f0f0ff"}
            onRequestClose={onClose}
            style={styles.modal}
        >
            <View style={styles.header}>
                <View style={styles.handle} />
                <Text style={styles.title}>{title}</Text>
            </View>

            {children}
        </Modal>
    )
}

interface SectionProps {
    title: string;
    options: any;
    children: React.ReactNode;
}

FormSheetModal.Section = (props: SectionProps) => {
    const {
        title,
        options,
        children
    } = props;

    return (
        <View style={styles.section}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}

            <View style={styles.sectionGroup}>
                {options
                ? options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.sectionItem}
                        onPress={option.onPress}
                    >
                        <Text style={[styles.sectionItemText, option.style]}>{option.title}</Text>
                    </TouchableOpacity>
                ))
                : children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modal: {
        
    },
    header: {
        padding: 16,
        alignItems: "center",
        gap:16
    },
    handle: {
        width: 60,
        height: 4,
        backgroundColor: "lightgray",
        borderRadius: 2
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    section: {
        paddingHorizontal: 16
    },
    sectionTitle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        fontWeight: "500",
        color: "gray"
    },
    sectionGroup: {
        backgroundColor: "white",
        borderRadius: 12
    },
    sectionItem: {
        height: 44,
        justifyContent: "center",
        paddingHorizontal: 16
    },
    sectionItemText: {
        fontSize: 16
    }
});