import { Challenge, SensorType } from '../models/challenge';

const colors = ['Rot', 'Blau', 'Grün', 'Gelb'];
const colorText: Record<string, string> = {
  Rot: 'roten', Blau: 'blauen', Grün: 'grünen', Gelb: 'gelben',
};

export class ChallengeGenerator {
  static generate(level: number, previousSensor?: SensorType): Challenge {
    const types: SensorType[] = [
      'shake', 'tilt', 'steps', 'microphone', 'button', 'colorButton',
    ];
    const available = types.filter(x => x !== previousSensor);
    const type = available[Math.floor(Math.random() * available.length)];

    switch (type) {
      case 'shake':
        return {
          id: Date.now(), title: 'Shake it!',
          task: `Schüttle dein Handy ${4 + level}-mal.`,
          timeLimitSeconds: 15, sensorType: 'shake', targetValue: 4 + level,
        };
      case 'tilt':
        return {
          id: Date.now(), title: 'Tilt!',
          task: `Neige dein Handy um ${20 + level * 3}° weiter.`,
          timeLimitSeconds: 12, sensorType: 'tilt',
          targetValue: 20 + level * 3,
        };
      case 'steps':
        return {
          id: Date.now(), title: 'Walk!',
          task: `Gehe ${10 + level * 4} Schritte.`,
          timeLimitSeconds: 30, sensorType: 'steps',
          targetValue: 10 + level * 4,
        };
      case 'microphone':
        return {
          id: Date.now(), title: 'Make some noise!',
          task: 'Erzeuge ein deutliches Geräusch.',
          timeLimitSeconds: 12, sensorType: 'microphone', targetValue: -20,
        };
      case 'button':
        return {
          id: Date.now(), title: 'Tap it!',
          task: `Drücke den Button ${5 + level * 2}-mal.`,
          timeLimitSeconds: 15, sensorType: 'button',
          targetValue: 5 + level * 2,
        };
      case 'colorButton': {
        const targetColor = colors[Math.floor(Math.random() * colors.length)];
        const labels = [...colors].sort(() => Math.random() - 0.5);
        const buttonColors = [...colors].sort(() => Math.random() - 0.5);
        const askForLabel = Math.random() < 0.5;
        const targetLabel = labels[buttonColors.indexOf(targetColor)];

        return {
          id: Date.now(), title: 'Correct color!',
          task: askForLabel
            ? `Drücke den Button ${targetLabel}.`
            : `Drücke den ${colorText[targetColor]} Button.`,
          timeLimitSeconds: 10, sensorType: 'colorButton',
          targetValue: 1, targetColor, askForLabel,
          colorButtons: buttonColors.map((color, index) => ({
            color, label: labels[index],
          })),
        };
      }
    }
  }
}
