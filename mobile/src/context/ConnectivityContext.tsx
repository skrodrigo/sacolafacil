import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ConnectivityContextType {
  isOffline: boolean;
  setOfflineMode: (isOffline: boolean) => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);

  const setOfflineMode = useCallback(async (offline: boolean) => {
    return new Promise<void>((resolve) => {
      setIsOffline(offline);
      // Give React time to process the state update
      setTimeout(resolve, 100);
    });
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOffline, setOfflineMode }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (context === undefined) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
