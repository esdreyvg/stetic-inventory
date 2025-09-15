import { createContext, useState, useContext, type ReactNode } from "react";

type Item = {
  id: string;
  name: string;
  quantity: number;
  // ...otros campos
};

type InventoryContextType = {
  items: Item[];
  setItems: (items: Item[]) => void;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  return (
    <InventoryContext.Provider value={{ items, setItems }}>
      {children}
    </InventoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory debe usarse dentro de InventoryProvider");
  return context;
}