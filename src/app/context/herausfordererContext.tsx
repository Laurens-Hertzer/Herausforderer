import { createContext, useState } from 'react';
import { Challenge } from '../models/challenge';
import { ChallengeGenerator } from '../services/ChallengeGenerator';

type ContextValue = {
  level: number;
  challenge: Challenge | null;
  generateChallenge: () => void;
  completeChallenge: () => void;
};

export const ChallengeContext = createContext<ContextValue | null>(null);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState(1);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const generateChallenge = () => {
    setChallenge(current =>
      ChallengeGenerator.generate(level, current?.sensorType)
    );
  };

  const completeChallenge = () => {
    setLevel(oldLevel => {
      const next = oldLevel + 1;
      setChallenge(current =>
        ChallengeGenerator.generate(next, current?.sensorType)
      );
      return next;
    });
  };

  return (
    <ChallengeContext.Provider value={{
      level, challenge, generateChallenge, completeChallenge,
    }}>
      {children}
    </ChallengeContext.Provider>
  );
}
