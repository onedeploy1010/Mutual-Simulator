import { createContext, useContext, useState, ReactNode } from 'react';
import type { TeamRewardResult, TeamRewardInput } from '@shared/schema';

interface TeamContextType {
  result: TeamRewardResult | null;
  input: TeamRewardInput | null;
  setTeamData: (result: TeamRewardResult, input: TeamRewardInput) => void;
  clearTeamData: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<TeamRewardResult | null>(null);
  const [input, setInput] = useState<TeamRewardInput | null>(null);

  const setTeamData = (newResult: TeamRewardResult, newInput: TeamRewardInput) => {
    setResult(newResult);
    setInput(newInput);
  };

  const clearTeamData = () => {
    setResult(null);
    setInput(null);
  };

  return (
    <TeamContext.Provider value={{ result, input, setTeamData, clearTeamData }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
