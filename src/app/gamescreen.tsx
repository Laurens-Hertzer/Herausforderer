import { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, DeviceMotion, Pedometer } from 'expo-sensors';
import {
  RecordingPresets, requestRecordingPermissionsAsync,
  setAudioModeAsync, useAudioRecorder, useAudioRecorderState,
} from 'expo-audio';
import { ChallengeContext } from './context/herausfordererContext';

const COLORS: Record<string, string> = {
  Rot: '#e53935', Blau: '#1e88e5', Grün: '#43a047', Gelb: '#fdd835',
};

export default function GameScreen() {
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
  const loudFrames = useRef(0);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const audio = useAudioRecorderState(recorder);

  useEffect(() => { generateChallenge(); }, []);

  useEffect(() => {
    if (!challenge) return;
    setTime(challenge.timeLimitSeconds);
    setValue(0);
    setStatus('Läuft');
    setLocked(false);
    tiltStart.current = null;
    loudFrames.current = 0;
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
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    })().catch(() => setStatus('Mikrofon-Fehler'));
    return () => { try { recorder.stop(); } catch {} };
  }, [challenge?.id, time > 0, locked]);

  useEffect(() => {
    if (!challenge || challenge.sensorType !== 'microphone' || locked) return;
    const meter = audio.metering;
    if (meter == null) return;

    // Nicht ein einzelner Peak: mehrere laute Messungen hintereinander.
    if (meter >= challenge.targetValue) loudFrames.current += 1;
    else loudFrames.current = 0;
    setValue(meter);
    if (loudFrames.current >= 8) finish();
  }, [audio.metering, challenge?.id, locked]);

  useEffect(() => {
    if (time === 0 && challenge && !locked) setStatus('Zeit abgelaufen');
  }, [time, challenge?.id, locked]);

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

  const colorTap = (name: string) => {
    if (locked || !challenge) return;
    if (name === challenge.targetColor) finish();
    else setStatus('Falsch! Versuch es erneut.');
  };

  if (!challenge) return <View style={styles.center}><Text>Lade Challenge...</Text></View>;

  const display = challenge.sensorType === 'microphone'
    ? value.toFixed(1)
    : challenge.sensorType === 'tilt' ? value.toFixed(0) : value.toFixed(0);
  const unit = challenge.sensorType === 'microphone' ? 'dB'
    : challenge.sensorType === 'tilt' ? '°'
    : challenge.sensorType === 'steps' ? 'Schritte' : '';

  return (
    <View style={styles.container}>
      <Text>Level {level}</Text>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.task}>{challenge.task}</Text>
      <Text style={styles.timer}>{time}s</Text>
      <View style={styles.valueBox}>
        <Text>Aktueller Wert</Text>
        <Text style={styles.value}>{display} {unit}</Text>
        <Text>{status}</Text>
      </View>

      {challenge.sensorType === 'button' && (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={tap}>
          <Text style={styles.buttonText}>DRÜCKEN</Text>
        </Pressable>
      )}

      {challenge.sensorType === 'colorButton' && (
        <View style={styles.colors}>
          {Object.entries(COLORS).map(([name, color]) => (
            <Pressable
              key={name}
              style={({ pressed }) => [styles.colorButton, { backgroundColor: color }, pressed && styles.pressed]}
              onPress={() => colorTap(name)}
            >
              <Text style={name === 'Gelb' ? styles.darkText : styles.buttonText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold' },
  task: { fontSize: 18, textAlign: 'center' },
  timer: { fontSize: 28 },
  valueBox: { alignItems: 'center', padding: 18, borderWidth: 1, borderRadius: 12, minWidth: 220 },
  value: { fontSize: 34, fontWeight: 'bold' },
  button: { paddingHorizontal: 45, paddingVertical: 20, borderRadius: 12, backgroundColor: '#005380' },
  pressed: { opacity: 0.65 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  darkText: { color: '#111', fontSize: 18, fontWeight: 'bold' },
  colors: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  colorButton: { width: 130, height: 70, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
