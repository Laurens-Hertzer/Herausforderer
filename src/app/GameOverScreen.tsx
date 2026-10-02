import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  score: number;
  level: number;
  onRestart: () => void;
  onHome: () => void;
};

export default function GameOverScreen({
  score,
  level,
  onRestart,
  onHome,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💥</Text>

      <Text style={styles.title}>GAME OVER!</Text>
      <Text style={styles.subtitle}>DAS WAR KNAPP!</Text>

      <View style={styles.card}>
        <Text style={styles.label}>DEIN SCORE</Text>
        <Text style={styles.score}>{score}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>LEVEL</Text>
        <Text style={styles.level}>{level}</Text>
      </View>

      <Pressable style={styles.restart} onPress={onRestart}>
        <Text style={styles.restartText}>NOCHMAL!</Text>
      </Pressable>

      <Pressable style={styles.home} onPress={onHome}>
        <Text style={styles.homeText}>ZURÜCK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#090B35',
  },
  emoji: { fontSize: 58, marginBottom: 8 },
  title: {
    color: '#FF3D9A',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#00E5FF',
    textShadowRadius: 12,
  },
  subtitle: {
    color: '#FFD23F',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 25,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00E5FF',
    backgroundColor: '#171B55',
    marginBottom: 24,
  },
  label: { color: '#B9C7F5', fontSize: 14, fontWeight: '800' },
  score: { color: '#FFFFFF', fontSize: 42, fontWeight: '900' },
  level: { color: '#35E58C', fontSize: 28, fontWeight: '900' },
  divider: {
    width: '70%',
    height: 2,
    backgroundColor: '#9B5CFF',
    marginVertical: 14,
  },
  restart: {
    width: '100%',
    padding: 17,
    borderRadius: 18,
    backgroundColor: '#FF3D9A',
    borderWidth: 2,
    borderColor: '#FFD23F',
    marginBottom: 12,
  },
  restartText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
  },
  home: {
    width: '100%',
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#367CFF',
  },
  homeText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
  },
});