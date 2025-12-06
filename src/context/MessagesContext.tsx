import { createContext, useContext, useState, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface MessagesContextValue {
  totalNoLeidos: number;
  setTotalNoLeidos: (n: number | ((prev: number) => number)) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const { isAuthenticated } = useAuth();

  // Carga inicial/global del total de no leídos
  useEffect(() => {
    const cargar = async () => {
      if (!isAuthenticated) {
        setTotalNoLeidos(0);
        return;
      }
      try {
        const convs = await chatApi.getConversaciones();
        const total = convs.reduce(
          (acc: number, c: { noLeidos: number }) => acc + (c.noLeidos || 0),
          0
        );
        setTotalNoLeidos(total);
      } catch (e) {
        console.error("Error cargando total de no leídos:", e);
      }
    };

    cargar();
  }, [isAuthenticated]);

  return (
    <MessagesContext.Provider value={{ totalNoLeidos, setTotalNoLeidos }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessagesContext = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessagesContext debe usarse dentro de MessagesProvider");
  }
  return ctx;
};
