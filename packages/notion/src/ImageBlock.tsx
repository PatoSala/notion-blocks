import { useState } from "react";
import { Image, View, StyleSheet, Dimensions, Text, Pressable } from "react-native";
import { BlockProps } from 'react-native-notion-blocks/src/components/Blocks/Block';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

export const ImageBlock = (props: BlockProps) => {
  const {
    blockId,
  } = props;

  const [source, setSource] = useState(null);
  const [aspectRatio, setAspectRatio] = useState();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSource(result.assets[0].uri);
      setAspectRatio(result.assets[0].width / result.assets[0].height);
    }
  };

  return (
    <Pressable style={styles.container} onPress={pickImage}>
        {!source
        ? (
            <View style={styles.row}>
                <Ionicons name="image-outline" size={24} color="#7d7a75" />
                <Text style={styles.text}>Add an image</Text>
            </View>
        )
        : (
            <Image
                style={[styles.image, { aspectRatio }]}
                source={{ uri: source }}
            />
        )
        }
      
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    backgroundColor: "#7d7a751d",
    marginHorizontal: 8,
    boxSizing: "border-box",
    borderRadius: 8,
    marginVertical: 4
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12
  },
  text: {
    color: "#7d7a75",
    fontWeight: "400"
  },
  image: {
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  }
});