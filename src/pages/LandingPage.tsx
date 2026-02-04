import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Environment, Float, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "maplibre-gl/dist/maplibre-gl.css";
import Lenis from "lenis";
import HomePage from "./HomePage";

gsap.registerPlugin(ScrollTrigger);

// 3D Model Component
function Model() {
    const gltf = useGLTF("/models/stylized_mangrove_greenhouse.glb");
    return (
        <Float speed={1.4} rotationIntensity={1.2} floatIntensity={0.6}>
            <primitive object={gltf.scene} scale={0.1} position={[0, 0, 0]} />
        </Float>
    );
}

useGLTF.preload("/models/stylized_mangrove_greenhouse.glb");

const STORY_COPY = [
    {
        kicker: "INTRO",
        title: "เริ่มเล่าเรื่อง",
        desc: "Stage ด้านซ้ายจะค้างไว้ แล้วเนื้อหาด้านขวาจะเลื่อนผ่านเพื่อเปลี่ยนฉาก",
        hint: "Scroll ต่อเพื่อเปลี่ยน Scene →",
    },
    {
        kicker: "SCENE 1",
        title: "ภาพรวมประเทศ",
        desc: "Scene นี้จะสั่งให้แผนที่ซูม/เอียงไปยังบริเวณตัวอย่าง",
        hint: "Scroll ต่อเพื่อไป Scene 2 →",
    },
    {
        kicker: "SCENE 2",
        title: "ผลผลิตและแนวโน้ม",
        desc: "Scene นี้จะสั่งให้แผนที่บินไปอีกพื้นที่ (ตัวอย่างภาคอีสาน)",
        hint: "จบ scrolly ↓",
    },
];

export default function LandingPage() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [scene, setScene] = useState(0);

    useLayoutEffect(() => {
        const lenis = new Lenis({
            duration: 1.1,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const tick = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: ".scrolly",
                start: "top top",
                end: "bottom bottom",
                pin: ".stage",
                pinSpacing: true,
                anticipatePin: 0,
            });

            const steps = gsap.utils.toArray<HTMLElement>(".story-step");
            steps.forEach((step, index) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => setScene(index),
                    onEnterBack: () => setScene(index),
                });
            });

            // ScrollTrigger.create({
            //     trigger: ".story-rail",
            //     start: "top top",
            //     end: "bottom bottom",
            //     pin: ".story-pin",
            //     pinSpacing: true,
            //     anticipatePin: 1,
            // });

            ScrollTrigger.refresh();
        }, rootRef);

        return () => {
            ctx.revert();
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        console.log(scene);
    }, [scene]);

    return (
        <div ref={rootRef} className="bg-slate-950 text-white flex justify-center">
            <div className="container mx-auto px-50">
                <section className="w-full py-20 relative">
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-black sm:text-7xl">
                            AGRICULTURAL
                            <span className="block text-[#13bf50]">STATISTICS</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-white/70">ระบบแสดงข้อมูลสถิติทางการเกษตรผ่านเทคโนโลยีแผนที่</p>
                    </div>

                    {/* <div className="relative w-1/2"> */}
                    <div className="absolute -top-[32%] right-0 h-137 w-137">
                        <Canvas camera={{ position: [7.6, 1.8, 3.2], fov: 45 }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[3, 4, 2]} intensity={1.2} />
                            <Suspense fallback={null}>
                                <Environment preset="city" />
                                <Bounds fit margin={1.2}>
                                    <Model />
                                </Bounds>
                            </Suspense>
                        </Canvas>
                    </div>
                    {/* </div> */}
                </section>

                {/* SCROLLY LAYOUT */}
                <section className="scrolly mx-auto max-w-6xl px-6 pb-24">
                    <div className="grid grid-cols-2 gap-10">
                        {/* PIN DIV */}
                        <div className="stage">
                            <div className="flex flex-col gap-4 pt-10">
                                <div className="relative">
                                    <div className="mt-2 text-2xl font-bold">ภาพรวมระบบ</div>
                                </div>

                                {/* MAP PANEL */}
                                <div className="relative h-150 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/30 pointer-events-none">
                                    <HomePage />
                                </div>

                                <div className="flex justify-center items-center gap-2">
                                    {Array.from({ length: STORY_COPY.length }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                scene === i ? "bg-[#13bf50] w-6" : "bg-white/20 w-2"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <div className="story-rail relative lg:py-16">
                                {/* <div className="story-pin">
                                    <div
                                        key={scene}
                                        className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
                                    >
                                        <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                            {STORY_COPY[scene]?.kicker}
                                        </div>

                                        <h2 className="mt-2 text-3xl font-bold">{STORY_COPY[scene]?.title}</h2>

                                        <p className="mt-3 text-white/70">{STORY_COPY[scene]?.desc}</p>

                                        <div className="mt-6 text-xs text-white/50">{STORY_COPY[scene]?.hint}</div>
                                    </div>
                                </div> */}

                                {/* steps ที่เลื่อนผ่านเพื่อเปลี่ยน scene */}
                                <div className="mt-10 space-y-20">
                                    <div className="story-step">
                                        <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                            <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                                INTRO
                                            </div>

                                            <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                            <p className="mt-3 text-white/70">
                                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus! Reprehenderit odit possimus natus.
                                            </p>

                                            <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                        </div>
                                    </div>
                                    <div className="story-step">
                                        <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                            <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                                INTRO
                                            </div>

                                            <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                            <p className="mt-3 text-white/70">
                                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus! Reprehenderit odit possimus natus.
                                            </p>

                                            <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                        </div>
                                    </div>
                                    <div className="story-step">
                                        <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                            <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                                INTRO
                                            </div>

                                            <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                            <p className="mt-3 text-white/70">
                                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus! Reprehenderit odit possimus natus.
                                            </p>

                                            <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                        </div>
                                    </div>
                                    <div className="h-[40vh]" />
                                </div>
                            </div>
                        </div>

                        {/* <div className="">
                            <div className="story-rail relative lg:py-16">
                                <div className="story-pin">
                                    <div
                                        key={scene}
                                        className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
                                    >
                                        <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                            {STORY_COPY[scene]?.kicker}
                                        </div>

                                        <h2 className="mt-2 text-3xl font-bold">{STORY_COPY[scene]?.title}</h2>

                                        <p className="mt-3 text-white/70">{STORY_COPY[scene]?.desc}</p>

                                        <div className="mt-6 text-xs text-white/50">{STORY_COPY[scene]?.hint}</div>
                                    </div>
                                </div>

                                <div className="mt-10 space-y-0">
                                    <div className="story-step h-[90vh]" />
                                    <div className="story-step h-[90vh]" />
                                    <div className="story-step h-[90vh]" />
                                    <div className="h-[40vh]" />
                                </div>
                            </div>
                        </div> */}
                    </div>
                </section>
            </div>
        </div>
    );
}
