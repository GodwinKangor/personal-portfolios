import { useEffect, useRef, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import meter1 from "../assets/img/meter1.svg";
import meter2 from "../assets/img/meter2.svg";
import meter3 from "../assets/img/meter3.svg";
import arrow1 from "../assets/img/arrow1.svg";
import arrow2 from "../assets/img/arrow2.svg";
import colorSharp from "../assets/img/color-sharp.png";

export const Skills = () => {
  const [autoPlay, setAutoPlay] = useState(true);
  const resumeTimer = useRef(null);
  const startTimeRef = useRef(Date.now()); // track component mount time
  const STARTUP_GRACE_MS = 1500; // ignore scroll during first 1.5s after load

  const pauseAutoplay = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setAutoPlay(false);
  };

  const resumeAutoplay = (delay = 1000) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setAutoPlay(true), delay);
  };

  // Pause while the user scrolls, resume after they stop
  useEffect(() => {
    const onScroll = () => {
      // ignore initial load scroll jitter
      if (Date.now() - startTimeRef.current < STARTUP_GRACE_MS) return;
      pauseAutoplay();
      resumeAutoplay(1000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pause when the tab loses focus, resume when visible again
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) pauseAutoplay();
      else resumeAutoplay(500);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 640 }, items: 2 },
    mobile: { breakpoint: { max: 640, min: 0 }, items: 1 },
  };

  const skills = [
    { img: meter1, label: "Web Development", pct: "90%" },
    { img: meter2, label: "Figma / UI Design", pct: "95%" },
    { img: meter3, label: "Logo Design", pct: "85%" },
    { img: meter1, label: "React & Zustand", pct: "92%" },
    { img: meter2, label: "Node / Express", pct: "88%" },
    { img: meter3, label: "Python / Data", pct: "80%" },
  ];

  const Arrow = ({ onClick, direction }) => (
    <button
      className={`arrow ${direction}`}
      onClick={(e) => {
        pauseAutoplay();
        onClick?.(e);
        resumeAutoplay(700);
      }}
      aria-label={`${direction} slide`}
    >
      <img src={direction === "left" ? arrow1 : arrow2} alt={direction} />
    </button>
  );

  return (
    <section className="skill" id="skills">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="skill-bx wow zoomIn">
              <h2>Skills</h2>
              <p>
                A mix of frontend, product, and visual design skills. <br />
                The carousel auto-plays but pauses while you interact or scroll.
              </p>

              <Carousel
                responsive={responsive}
                infinite
                autoPlay={autoPlay}
                autoPlaySpeed={2200}
                customTransition="transform 400ms ease"
                transitionDuration={400}
                pauseOnHover
                swipeable
                draggable
                renderButtonGroupOutside
                customLeftArrow={<Arrow direction="left" />}
                customRightArrow={<Arrow direction="right" />}
                className="owl-carousel owl-theme skill-slider"
                onMouseEnter={pauseAutoplay}
                onMouseLeave={() => resumeAutoplay(800)}
                onTouchStart={pauseAutoplay}
                onTouchEnd={() => resumeAutoplay(800)}
                shouldResetAutoplay={false}
              >
                {skills.map((s, i) => (
                  <div className="item" key={i}>
                    <img src={s.img} alt={s.label} />
                    <h5>{s.label}</h5>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
      <img className="background-image-left" src={colorSharp} alt="bg" />
      <style jsx>{`
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 9999px;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          cursor: pointer;
          z-index: 2;
        }
        .arrow.left {
          left: -12px;
        }
        .arrow.right {
          right: -12px;
        }
        .arrow img {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </section>
  );
};
