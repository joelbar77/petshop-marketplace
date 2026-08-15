import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";
import { applyBrandColor } from "../utils/color";

const SettingsContext = createContext(null);

const DEFAULTS = {
  businessName: "PetShop",
  logoUrl: null,
  primaryColor: "#ea7c1e",
  heroTitle: "Todo para tu mascota, en un solo lugar",
  heroSubtitle: "Alimento, juguetes, higiene y accesorios para perros, gatos y más.",
  heroImageUrl: null,
  sectionsOrder: "hero,banners,categories,products",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  async function reload() {
    try {
      const { data } = await client.get("/settings");
      setSettings(data);
      applyBrandColor(data.primaryColor);
      document.title = data.businessName;
    } catch {
      // si falla, seguimos con los valores por defecto
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
