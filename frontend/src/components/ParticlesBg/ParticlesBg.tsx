import './ParticlesBg.css';
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

function ParticlesBg() {
 const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(() => ({
  background: {
    color: { value: "#0b0b0b" }
  },
  fpsLimit: 60,
  interactivity: {
  events: {
    onClick: { enable: true, mode: "push" },
    onHover: { enable: true, mode: "repulse" },
    resize:   { enable: true }
  },
  modes: {
    push:    { quantity: 4 },
    repulse: { distance: 150, duration: 0.6 }
  }
},
  particles: {
    color: {
      value: ["#ff007f", "#00e5ff", "#7fff00", "#ffea00"]
    },
    shape: {
      type: ["circle", "triangle", "star"],
      options: {
        star: { sides: 5, inset: 0.4 }
      }
    },
    opacity: {
      value: 0.8,
      random: { enable: true, minimumValue: 0.4 }
    },
    size: {
      value: { min: 2, max: 6 },
      random: true
    },
    links: {
      enable: true,
      distance: 120,
      color: "#ffffff",
      opacity: 0.2,
      width: 1
    },
    move: {
      enable: true,
      speed: 2,
      direction: MoveDirection.none,
      random: false,
      straight: false,
      outModes: { default: OutMode.bounce }
    },
    twinkle: {
      particles: {
        enable: true,
        frequency: 0.05,
        opacity: 1
      }
    },
    number: {
      density: { enable: true, area: 800 },
      value: 100
    }
  },
  detectRetina: true
}), []);

  if (init) {
    return (
        <div className="particles-container">
            <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
        </div>
      
    );
  }

  return <></>;
}

export default ParticlesBg
