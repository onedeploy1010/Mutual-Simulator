import { createContext, useContext, useState, ReactNode } from 'react';
import type { InvestmentResult, InvestmentInput } from '@shared/schema';

interface InvestmentContextType {
  result: InvestmentResult | null;
  input: InvestmentInput | null;
  setInvestmentData: (result: InvestmentResult, input: InvestmentInput) => void;
  clearInvestmentData: () => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [input, setInput] = useState<InvestmentInput | null>(null);

  const setInvestmentData = (newResult: InvestmentResult, newInput: InvestmentInput) => {
    setResult(newResult);
    setInput(newInput);
  };

  const clearInvestmentData = () => {
    setResult(null);
    setInput(null);
  };

  return (
    <InvestmentContext.Provider value={{ result, input, setInvestmentData, clearInvestmentData }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }
  return context;
}
