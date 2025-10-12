import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NoteScreen from './features/notes/screens/NoteScreen';
import AltNotesScreen from './features/notes/screens/AltNotesScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <NoteScreen />
      {/* <AltNotesScreen /> */}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

