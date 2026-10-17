"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siJetbrains, siPolygon, siDigitalocean, siUnstop, siSketch } from "simple-icons";

const FRAME_COUNT = 300;
const framePath = (index) => `/scroll-frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const sponsors = [
  { name: "JetBrains", icon: siJetbrains }, { name: "Devfolio", glyph: "D/" },
  { name: "Polygon", icon: siPolygon }, { name: "DigitalOcean", icon: siDigitalocean },
  { name: ".xyz", glyph: ".xyz" }, { name: "unstop", icon: siUnstop },
  { name: "tezos", glyph: "ꜩ" }, { name: "CSSBattle", glyph: "CSS{" },
  { name: "Sketch", icon: siSketch }, { name: "celo", glyph: "CELO" },
  { name: "Filecoin", glyph: "ƒ" }, { name: "Voiceflow", glyph: "VF" },
];

const rituals = [
  { number: "01", title: "Claim an issue.", copy: "Browse live project boards, find a challenge that feels just out of reach, and make it yours.", petal: "桜", kind: "seed" },
  { number: "02", title: "Build with your people.", copy: "Pair with mentors and contributors. Ask freely, explore deeply, and grow your solution in public.", petal: "芽", kind: "vine" },
  { number: "03", title: "Open a pull request.", copy: "Turn your work into a contribution. Review, refine, and let the community help it become stronger.", petal: "風", kind: "branch" },
  { number: "04", title: "Leave a living trace.", copy: "Watch your contribution join something bigger—on the leaderboard and in the open-source world.", petal: "光", kind: "bloom" },
];

const projects = [
  { title: "Mizu", tag: "Climate / 2025", image: "/scroll-frames/frame_0046.jpg", copy: "A community water-monitoring kit that turns local observations into clean, open environmental data.", stack: "Python · LoRa · Open data" },
  { title: "Kintsugi", tag: "Accessibility / 2024", image: "/scroll-frames/frame_0128.jpg", copy: "A browser companion helping students turn dense learning material into adaptable, accessible formats.", stack: "Next.js · AI · Web Speech" },
  { title: "Sora", tag: "Civic tech / 2024", image: "/scroll-frames/frame_0216.jpg", copy: "A beautifully simple map for reporting and following neighbourhood-scale public issues together.", stack: "React · Maps · Supabase" },
  { title: "Mori", tag: "Culture / 2023", image: "/scroll-frames/frame_0282.jpg", copy: "An open archive that lets independent artists preserve, annotate, and share their work on their own terms.", stack: "Three.js · IPFS · Archive" },
];

function SponsorMark({ sponsor }) {
  if (sponsor.icon) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={sponsor.icon.path} /></svg>;
  return <span className={`sponsor-glyph ${sponsor.name.toLowerCase().replace(/[^a-z]/g, "")}`}>{sponsor.glyph}</span>;
}

export default function Home() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [activeProject, setActiveProject] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: false });
    const frames = Array.from({ length: FRAME_COUNT });
    const requestedFrames = new Set();
    let currentFrame = 0;

    const drawFrame = (index = currentFrame) => {
      const image = frames[index];
      if (!image?.complete || !image.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.fillStyle = "#16121a";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    };

    const loadFrame = (index) => {
      if (index < 0 || index >= FRAME_COUNT || requestedFrames.has(index)) return;
      requestedFrames.add(index);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        frames[index] = image;
        if (index === 0) { drawFrame(0); setLoaded(true); }
        if (index === currentFrame) drawFrame(index);
      };
      image.src = framePath(index);
    };

    const warmFrames = (index) => {
      // Keep the next frames decoded before the user reaches them, without
      // saturating the network and main thread with all 300 images at once.
      for (let frame = index - 8; frame <= index + 32; frame += 1) loadFrame(frame);
    };
    warmFrames(0);

    const sequence = { frame: 0 };
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=460%",
          scrub: 0.45,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(".site-header", { autoAlpha: 0, y: -22, duration: 0.12 }, 0.07)
        .to(".opening-copy", { autoAlpha: 0, y: -35, filter: "blur(9px)", duration: 0.13 }, 0.12)
        .to(sequence, { frame: FRAME_COUNT - 1, duration: 1, ease: "none", onUpdate: () => { currentFrame = Math.round(sequence.frame); warmFrames(currentFrame); drawFrame(currentFrame); } }, 0)
        .fromTo(".manifesto", { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.54)
        .fromTo(".manifesto .line", { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, stagger: 0.022, duration: 0.14, ease: "power3.out" }, 0.56)
        .to(".manifesto", { autoAlpha: 0, y: -32, filter: "blur(8px)", duration: 0.08 }, 0.92);
    }, heroRef);
    const handleResize = () => drawFrame(currentFrame);
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); ctx.revert(); ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); };
  }, []);

  useEffect(() => {
    const section = document.querySelector(".how-flow");
    const cards = gsap.utils.toArray(".ritual-card");
    if (!section || !cards.length) return undefined;
    const ctx = gsap.context(() => cards.forEach((card, index) => {
      gsap.fromTo(card, { opacity: 0, y: 65, rotateY: index % 2 ? 18 : -18 }, {
        opacity: 1, y: 0, rotateY: 0, duration: .8, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 86%", toggleActions: "play none none reverse" },
      });
    }));
    return () => ctx.revert();
  }, []);

  return <main>
    <section className="scroll-hero" ref={heroRef} id="top">
      <canvas ref={canvasRef} className="frame-canvas" aria-label="A cinematic Japanese landscape" />
      <div className="frame-shade" />
      {!loaded && <div className="loader">LOADING THE PATH <span /></div>}
      <header className="site-header">
        <a className="event-logo" href="#top">
          <span style={{ fontSize: "clamp(20px, 2vw, 31px)", fontWeight: 500, letterSpacing: ".105em" }}>OPENCODE</span>
          <b style={{ marginLeft: "6px" }}>’26</b>
        </a>
        <a className="center-mark" href="#top" style={{ position: "static", transform: "none", gridColumn: 2 }}>
          GEEKHAVEN <b>×</b> OPENCODE
        </a>
        <nav style={{ gridColumn: 3, justifySelf: "end" }}><a href="#how-it-works">HOW IT WORKS</a><a href="#about">ABOUT</a><a href="#apply">APPLY <span>↗</span></a></nav>
      </header>
      <div className="opening-copy"><p className="kicker">IIITA NATIONAL OPEN SOURCE FESTIVAL — 2026</p><h1>FOLLOW THE<br /><i>UNWRITTEN</i> PATH.</h1><p className="scroll-cue">SCROLL TO BEGIN <span>↓</span></p></div>
      <div className="manifesto"><p className="manifesto-tag">OPEN SOURCE IS A PRACTICE</p><h2><span className="clip"><span className="line">SHIP PRODUCTION-</span></span><span className="clip"><span className="line accent">GRADE PROJECTS.</span></span><span className="clip"><span className="line">GIT PUSH. MERGE.</span></span><span className="clip"><span className="line accent">COMMIT TO MORE.</span></span></h2><p className="manifesto-foot">READY FOR OPEN SOURCE <span>↗</span></p></div>
      <div className="scroll-index"><span>01</span><i /> <span>04</span></div>
    </section>
    <section className="trusted-section" id="about">
      <p className="trusted-kicker">TRUSTED BY THE ONES WHO BUILD FOR TOMORROW</p>
      <h2>POWERED BY<br /><i>OPEN THINKERS.</i></h2>
      <div className="sponsor-marquee" aria-label="Sponsor marquee">
        <div className="sponsor-marquee-track">
          {[...sponsors, ...sponsors].map((sponsor, index) => <div className="marquee-sponsor" key={`${sponsor.name}-${index}`}><SponsorMark sponsor={sponsor} /><span>{sponsor.name}</span><i>✦</i></div>)}
        </div>
      </div>
      <p className="trusted-foot">AND A COMMUNITY OF MAKERS WHO REFUSE TO STAND STILL <span>✦</span></p>
    </section>
    <section className="how-flow" id="how-it-works">
      <div className="ritual-caption"><p>02 — HOW IT WORKS</p><h2>FOLLOW THE<br /><i>FALLING PETALS.</i></h2><span>ONE INTENTIONAL STEP AT A TIME ↓</span></div>
      <div className="ritual-stage">
        {rituals.map((ritual) => <article className="ritual-card" key={ritual.number}>
          <div className={`ritual-illustration ${ritual.kind}`}><span>{ritual.petal}</span><i /><i /><i /></div>
          <b>{ritual.number}</b><div className="ritual-copy"><p className="ritual-label">OPENCODE RITUAL</p><h3>{ritual.title}</h3><p>{ritual.copy}</p><span>CONTINUE THE JOURNEY ↗</span></div>
        </article>)}
      </div>
      <div className="ritual-count">01 — 04</div>
    </section>
    <section className="projects-section" id="projects">
      <div className="projects-top"><p>03 — PAST PROJECTS</p><h2>WORK THAT<br /><i>KEPT GROWING.</i></h2><span>SELECT A STORY ↘</span></div>
      <div className="project-layout">
        <div className="project-rail">{projects.map((project, index) => <button className={index === activeProject ? "project-thumb active" : "project-thumb"} onClick={() => setActiveProject(index)} key={project.title}><img src={project.image} alt="" /><span>{String(index + 1).padStart(2, "0")}</span><b>{project.title}</b></button>)}</div>
        <article className="project-detail"><div className="project-image" style={{ backgroundImage: `url(${projects[activeProject].image})` }} /><div className="project-detail-copy"><p>{projects[activeProject].tag}</p><h3>{projects[activeProject].title}</h3><span className="project-rule" /><p className="project-description">{projects[activeProject].copy}</p><small>{projects[activeProject].stack}</small><a href="#apply">EXPLORE CASE STUDY ↗</a></div></article>
      </div>
    </section>
  </main>;
}
