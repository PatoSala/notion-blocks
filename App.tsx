import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NoteScreen from './features/notes/screens/NoteScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <NoteScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

