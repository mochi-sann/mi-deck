import { type ReactNode, useEffect } from "react";
import { useSetAtom } from "jotai";
import { mfmConfigAtom } from "mfm-react-render";
import { useStorage } from "@/lib/storage/context";

interface MfmConfigProviderProps {
  children: ReactNode;
}

export function MfmConfigProvider({ children }: MfmConfigProviderProps) {
  const { appSettings } = useStorage();
  const setMfmConfig = useSetAtom(mfmConfigAtom);
  const mfmAdvanced = appSettings?.mfmAdvanced ?? true;
  const mfmAnimation = appSettings?.mfmAnimation ?? true;

  useEffect(() => {
    setMfmConfig((prev) => ({
      ...prev,
      advanced: mfmAdvanced,
      animation: mfmAnimation,
    }));
  }, [setMfmConfig, mfmAdvanced, mfmAnimation]);

  return children;
}
