import React, { useEffect, useRef, useState } from "react";

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  dur: number;
  color: string;
}

interface SparkleProps {
  children: React.ReactNode;
}

const colors = ["#FF1493", "#00FFFF", "#FFE202", "#FFE202", "#FFE202"] as const;

const Sparkle: React.FC<SparkleProps> = ({ children }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = false;

    const resizeObserver = new ResizeObserver(() => {
      if (elementRef.current) {
        setDimensions({
          width: elementRef.current.offsetWidth + 64,
          height: elementRef.current.offsetHeight + 64,
        });
      }
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    // Track timeouts to clear them on unmount
    const timeouts = new Set<NodeJS.Timeout>();

    const safeSetTimeout = (callback: () => void, delay: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        callback();
      }, delay);
      timeouts.add(id);
      return id;
    };

    const addParticle = () => {
      if (stopRef.current) return;

      const x = Math.random() * (dimensions.width - 64);
      const y = Math.random() * (dimensions.height - 64);
      const sizeFactor = Math.random();
      const particle: Particle = {
        id: Math.random().toString(),
        x,
        y,
        size: 0.2 + (sizeFactor / 10) * 3,
        dur: 1000 + sizeFactor * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setParticles((prev) => [...prev, particle]);

      // Remove particle after animation
      safeSetTimeout(() => {
        if (stopRef.current) return;
        setParticles((prev) => prev.filter((p) => p.id !== particle.id));
      }, particle.dur - 100);

      // Schedule next particle
      safeSetTimeout(
        () => {
          addParticle();
        },
        500 + Math.random() * 500,
      );
    };

    // Start adding particles after dimensions are set
    if (dimensions.width > 0 && dimensions.height > 0) {
      addParticle();
    }

    return () => {
      stopRef.current = true;
      resizeObserver.disconnect();
      for (const id of timeouts) {
        clearTimeout(id);
      }
      timeouts.clear();
    };
  }, [dimensions.width, dimensions.height]);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span ref={elementRef} style={{ display: "inline-block" }}>
        {children}
      </span>
      {particles.map((particle) => (
        <svg
          key={particle.id}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: "-32px",
            left: "-32px",
            pointerEvents: "none",
          }}
        >
          <title>Sparkle</title>
          <path
            style={
              {
                "--translateX": `${particle.x}px`,
                "--translateY": `${particle.y}px`,
                "--duration": `${particle.dur}ms`,
                "--size": particle.size,
                transformOrigin: "center",
                transformBox: "fill-box",
                translate: "var(--translateX) var(--translateY)",
                animation: "mfm-sparkle var(--duration) linear infinite",
              } as React.CSSProperties
            }
            fill={particle.color}
            d="M29.427,2.011C29.721,0.83 30.782,0 32,0C33.218,0 34.279,0.83 34.573,2.011L39.455,21.646C39.629,22.347 39.991,22.987 40.502,23.498C41.013,24.009 41.653,24.371 42.354,24.545L61.989,29.427C63.17,29.721 64,30.782 64,32C64,33.218 63.17,34.279 61.989,34.573L42.354,39.455C41.653,39.629 41.013,39.991 40.502,40.502C39.991,41.013 39.629,41.653 39.455,42.354L34.573,61.989C34.279,63.17 33.218,64 32,64C30.782,64 29.721,63.17 29.427,61.989L24.545,42.354C24.371,41.653 24.009,41.013 23.498,40.502C22.987,39.991 22.347,39.629 21.646,39.455L2.011,34.573C0.83,34.279 0,33.218 0,32C0,30.782 0.83,29.721 2.011,29.427L21.646,24.545C22.347,24.371 22.987,24.009 23.498,23.498C24.009,22.987 24.371,22.347 24.545,21.646L29.427,2.011Z"
          />
        </svg>
      ))}
    </span>
  );
};

export default Sparkle;
