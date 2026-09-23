import { StyleSheet, Text, View } from 'react-native';

// A stand-in for routes not yet built. Step 1+ replaces these with real
// screens from src/components.
export function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F4EE',
  },
  text: {
    fontSize: 20,
    color: '#16181D',
  },
});
