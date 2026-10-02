import { Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton({ onPress, title }: { onPress: () => void; title: string }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3D9A',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD23F',
    shadowColor: '#FF3D9A',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
});