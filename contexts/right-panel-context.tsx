"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface RightPanelContextValue {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
}

const RightPanelContext = createContext<RightPanelContextValue>({
  content: null,
  setContent: () => {},
});

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ReactNode | null>(null);

  const setContent = useCallback((c: ReactNode | null) => {
    setContentState(c);
  }, []);

  return (
    <RightPanelContext.Provider value={{ content, setContent }}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  return useContext(RightPanelContext);
}
