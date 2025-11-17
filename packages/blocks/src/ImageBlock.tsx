import { useState } from "react";
import { Image, View, StyleSheet, Dimensions, Text, Pressable, Modal, Button } from "react-native";
import { BlockProps } from '@react-native-blocks/core';
import { Ionicons } from '@expo/vector-icons';
import { useBlocksContext, useBlock } from "@react-native-blocks/core";
import * as ImagePicker from 'expo-image-picker';

import { updateBlockData } from "@react-native-blocks/core";

const { width } = Dimensions.get("window");

/**
 * Image block specific properties:
 * source: string
 * 
 * Image block specific format:
 * block_width: number,
 * block_aspect_ratio: number
 */

export const ImageBlock = (props: BlockProps) => {
  const {
    blockId,
  } = props;
  const { blocks, updateBlock, selectedBlockId, setSelectedBlockId, removeBlock } = useBlocksContext();
  const { properties } = useBlock(blockId);

  const [source, setSource] = useState(blocks[blockId]?.properties.source || null);
  const [aspectRatio, setAspectRatio] = useState(blocks[blockId]?.format?.block_aspect_ratio || null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSource(result.assets[0].uri);
      setAspectRatio(result.assets[0].width / result.assets[0].height);

      const updatedBlock = updateBlockData(blocks[blockId], {
        properties: {
          source: result.assets[0].uri
        },
        format: {
          block_width: result.assets[0].width,
          block_aspect_ratio: result.assets[0].width / result.assets[0].height
        }
      });

      updateBlock(updatedBlock);
    }
  };

  const handleRemoveBlock = () => {
      setSelectedBlockId(null);
      setTimeout(() => {
          removeBlock(blockId);
      }, 100);
  };

  const backgroundColor = source === null ? "#7d7a751d" : "transparent";

  return (
    <>
      <Pressable
        style={[styles.container, { backgroundColor: backgroundColor }]}
        onPress={pickImage}
      >
          {source === null
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

      <Modal
        visible={selectedBlockId === blockId}
        presentationStyle="pageSheet"
        animationType="slide"
      >
          <Button
              title="Close"
              onPress={() => setSelectedBlockId(null)}
          />

          <Button
              title="Remove"
              onPress={handleRemoveBlock}
          />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
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