import { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, DeviceMotion, Pedometer } from 'expo-sensors';
import {
  requestRecordingPermissionsAsync, useAudioStream,
} from 'expo-audio';
import GameOverScreen from './GameOverScreen';
import { ChallengeContext } from './context/herausfordererContext';
import { useRouter } from 'expo-router';

const COLORS: Record<string, string> = {
  background: '#090B35',
  card: '#171B55',
  cyan: '#00E5FF',
  blue: '#367CFF',
  purple: '#9B5CFF',
  pink: '#FF3D9A',
  orange: '#FF6B35',
  yellow: '#FFD23F',
  green: '#35E58C',
  white: '#FFFFFF',
  text: '#F4F7FF',
  muted: '#B9C7F5',

  Rot: '#FF4D5A',
  Blau: '#367CFF',
  Grün: '#35D98A',
  Gelb: '#FFD23F',
};
export default function GameScreen() {

  const router = useRouter();

  const ctx = useContext(ChallengeContext);
  if (!ctx) return <Text>ChallengeProvider fehlt.</Text>;
  const { challenge, level, generateChallenge, completeChallenge } = ctx;
  const [time, setTime] = useState(0);
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState('Bereit');
  const [locked, setLocked] = useState(false);
  const lastShake = useRef(0);
  const lastStep = useRef(0);
  const tiltStart = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  const speechScore = useRef(0);
  const audioStream = useAudioStream({
    channels: 1,
    encoding: 'float32',
    sampleRate: 16000,
    onBuffer: buffer => {
      if (!challenge || challenge.sensorType !== 'microphone' || locked) return;
      const data = new Float32Array(buffer.data);
      if (data.length < 100) return;
      let sum = 0;
      let crossings = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
        if (i > 0 && ((data[i - 1] < 0 && data[i] >= 0) || (data[i - 1] >= 0 && data[i] < 0))) crossings++;
      }
      const rms = Math.sqrt(sum / data.length);
      const zeroCrossingRate = crossings / data.length;
      const speechLike = rms > 0.025 && zeroCrossingRate > 0.015 && zeroCrossingRate < 0.25;
      if (speechLike) {
        speechScore.current = Math.min(10, speechScore.current + 1);
      } else {
        speechScore.current = Math.max(0, speechScore.current - 0.5);
      }
      if (speechScore.current >= 5) {
        speechScore.current = 0;
        setValue(v => v + 1);
        finish();
      }
    },
  });
  useEffect(() => { generateChallenge(); }, []);
  useEffect(() => {
    if (!challenge) return;
    setTime(challenge.timeLimitSeconds);
    setValue(0);
    setStatus('Läuft');
    setLocked(false);
    tiltStart.current = null;
    speechScore.current = 0;
  }, [challenge?.id]);
  useEffect(() => {
    if (!challenge || time <= 0 || locked) return;
    const id = setTimeout(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearTimeout(id);
  }, [time, challenge?.id, locked]);
  useEffect(() => {
    if (!challenge || time <= 0 || locked || challenge.sensorType !== 'shake') return;
    Accelerometer.setUpdateInterval(80);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const strength = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (strength > 1.8 && now - lastShake.current > 450) {
        lastShake.current = now;
        setValue(v => v + 1);
      }
    });
    return () => sub.remove();
  }, [challenge?.id, time > 0, locked]);
  useEffect(() => {
    if (!challenge || challenge.sensorType !== 'steps' || time <= 0 || locked) return;
    let sub: { remove: () => void } | undefined;
    (async () => {
      if (!(await Pedometer.isAvailableAsync())) {
        setStatus('Schrittzähler nicht verfügbar');
        return;
      }
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        setStatus('Schrittzähler-Berechtigung fehlt');
        return;
      }
      sub = Pedometer.watchStepCount(result => {
        setValue(result.steps);
      });
    })();
    return () => sub?.remove();
  }, [challenge?.id, time > 0, locked]);
  useEffect(() => {
    if (!challenge || challenge.sensorType !== 'tilt' || time <= 0 || locked) return;
    DeviceMotion.setUpdateInterval(50);
    const sub = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
      if (!accelerationIncludingGravity) return;
      const { x, y, z } = accelerationIncludingGravity;
      if (!tiltStart.current) {
        tiltStart.current = { alpha: x, beta: y, gamma: z };
        return;
      }
      const start = tiltStart.current;
      const startLength = Math.sqrt(start.alpha ** 2 + start.beta ** 2 + start.gamma ** 2);
      const currentLength = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const dot = start.alpha * x + start.beta * y + start.gamma * z;
      const cosine = Math.max(-1, Math.min(1, dot / (startLength * currentLength)));
      const angle = Math.acos(cosine) * 180 / Math.PI;
      setValue(angle);
    });
    return () => sub.remove();
  }, [challenge?.id, time > 0, locked]);
  useEffect(() => {
    if (!challenge || time <= 0 || locked) return;
    if (value < challenge.targetValue) return;
    if (challenge.sensorType !== 'shake' && challenge.sensorType !== 'steps' && challenge.sensorType !== 'tilt') return;
    finish();
  }, [value, challenge?.id, locked]);
  useEffect(() => {
    if (!challenge || challenge.sensorType !== 'microphone' || time <= 0 || locked) return;
    (async () => {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setStatus('Mikrofon-Berechtigung fehlt');
        return;
      }
      await audioStream.stream.start();
    })().catch(() => setStatus('Mikrofon-Fehler'));
    return () => {
      try { audioStream.stream.stop(); } catch { }
    };
  }, [challenge?.id, time > 0, locked]);

  const finish = () => {
    if (locked) return;
    setLocked(true);
    setStatus('Geschafft!');
    setTimeout(completeChallenge, 250);
  };
  const tap = () => {
    if (locked || !challenge) return;
    setValue(v => v + 1);
    if (value + 1 >= challenge.targetValue) finish();
  };
const colorTap = (buttonColor: string, buttonLabel: string) => {
  if (locked || !challenge) return;

  const target = challenge.targetColor;
  const correct = challenge.askForLabel
    ? buttonLabel === challenge.colorButtons?.find(b => b.color === target)?.label
    : buttonColor === target;

  if (correct) {
    finish();
  } else {
    setStatus('Game Over!');
    setLocked(true);
  }
};
  if (!challenge) return <Text>Challenge wird geladen...</Text>;
  const display = value.toFixed(0);
  const unit = challenge.sensorType === 'microphone' ? 'Treffer'
    : challenge.sensorType === 'tilt' ? '°'
      : challenge.sensorType === 'steps' ? 'Schritte' : '';
  return (
    <View style={styles.container}>
      <Text style={styles.level}>Level {level}</Text>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.task}>{challenge.task}</Text>
      <Text style={styles.timer}>{time}s</Text>
      <View style={styles.valueBox}>
        <Text style={styles.value}>Aktueller Wert</Text>
        <Text style={styles.value}>{display} {unit}</Text>
        <Text style={styles.level}>{status}</Text>
      </View>
      {challenge.sensorType === 'button' && (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={tap}>
          <Text style={styles.buttonText}>DRÜCKEN</Text>
        </Pressable>
      )}
      {challenge.sensorType === 'colorButton' && (
        <View style={styles.colors}>
          {challenge.colorButtons?.map(button => (
            <Pressable
              key={`${button.label}-${button.color}`}
              style={({ pressed }) => [
                styles.colorButton,
                { backgroundColor: COLORS[button.color] },
                pressed && styles.pressed,
              ]}
              onPress={() => colorTap(button.color, button.label)}
            >
              <Text style={button.color === 'Gelb' ? styles.darkText : styles.buttonText}>
                {button.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    gap: 14,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  level: {
    color: COLORS.yellow,
    fontSize: 17,
    fontWeight: '900',
  },
  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  task: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  timer: {
    color: COLORS.orange,
    fontSize: 36,
    fontWeight: '900',
  },
  valueBox: {
    alignItems: 'center',
    padding: 20,
    minWidth: 250,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  value: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '900',
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: COLORS.pink,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    elevation: 8,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  darkText: {
    color: '#15152F',
    fontSize: 18,
    fontWeight: '900',
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorButton: {
    width: 140,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 6,
  },
});
