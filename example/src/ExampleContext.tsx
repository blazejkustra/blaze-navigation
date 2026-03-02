import { createContext, useContext } from 'react';

export const ExampleContext = createContext<{ onBack: () => void }>({
  onBack: () => {},
});

export function useExampleBack() {
  return useContext(ExampleContext).onBack;
}
