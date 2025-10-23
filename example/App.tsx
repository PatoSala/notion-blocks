import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NoteScreen from './src/notes/screens/NoteScreen';
import AltNotesScreen from './src/notes/screens/AltNotesScreen';
import Editor from '../src/components/Editor';

export default function App() {
  return (
    <SafeAreaProvider>
      <Editor />
      {/* <AltNotesScreen /> */}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

