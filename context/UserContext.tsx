import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  balance: number;
  username: string;
  updateBalance: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial State
  const [balance, setBalance] = useState<number>(2500.00);
  const [username] = useState<string>("Pilot_001");

  const updateBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <UserContext.Provider value={{ balance, username, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};