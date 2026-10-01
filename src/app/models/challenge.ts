export type SensorType =
  | 'shake'
  | 'tilt'
  | 'steps'
  | 'microphone'
  | 'button'
  | 'colorButton';

export interface Challenge {
  id: number;
  title: string;
  task: string;
  timeLimitSeconds: number;
  sensorType: SensorType;
  targetValue: number;
  targetColor?: string;
  colorButtons?: { label: string; color: string }[];
  askForLabel?: boolean;
}
