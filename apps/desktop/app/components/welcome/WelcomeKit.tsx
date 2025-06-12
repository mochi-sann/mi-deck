import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import EraShape from "./EraShape";
import ElectronContent from "./contents/ElectronContent";
import EraContent from "./contents/EraContent";
import ReactContent from "./contents/ReactContent";
import ShadContent from "./contents/ShadContent";
import TailwindContent from "./contents/TailwindContent";
import ViteContent from "./contents/ViteContent";
import "./styles.css";

export default function WelcomeKit() {
  const [activePath, setActivePath] = useState<number>(5);

  const handlePathHover = (index: number) => {
    setActivePath(index);
  };

  const handlePathReset = () => {
    setActivePath(5);
  };

  const content = () => {
    switch (activePath) {
      case 0:
        return <ElectronContent />;
      case 1:
        return <ReactContent />;
      case 2:
        return <ViteContent />;
      case 3:
        return <ShadContent />;
      case 4:
        return <TailwindContent />;
      case 5:
        return <EraContent />;
      default:
        return <EraContent />;
    }
  };

  return (
    <div className="welcome-content flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={"content-" + activePath}
            style={{ zIndex: 2, flex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            {content()}
          </motion.div>
        </AnimatePresence>
        <EraShape onPathHover={handlePathHover} onPathReset={handlePathReset} />
      </div>
      <div className="flex items-center justify-center gap-4 opacity-50 transition-opacity hover:opacity-80">
        <DarkModeToggle />
      </div>
    </div>
  );
}

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex cursor-pointer items-center justify-center gap-2 text-sm">
      <Badge variant="secondary" onClick={toggleDarkMode}>
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </Badge>
    </div>
  );
};
