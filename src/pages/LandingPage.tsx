import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Environment, Float, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "maplibre-gl/dist/maplibre-gl.css";
import Lenis from "lenis";
import HomePage from "./HomePage";
import type { MapRef } from "react-map-gl/maplibre";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

function Model() {
    const gltf = useGLTF("/models/stylized_mangrove_greenhouse.glb");
    return (
        <Float speed={1.4} rotationIntensity={1.2} floatIntensity={0.6}>
            <primitive object={gltf.scene} scale={0.1} position={[0, 0, 0]} />
        </Float>
    );
}

useGLTF.preload("/models/stylized_mangrove_greenhouse.glb");

const LandingPage = () => {
    const navigate = useNavigate();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapRef>(null);
    const [scene, setScene] = useState<number | null>(null);
    const [step_length, setStepLength] = useState<number>(0);

    const fnFlyToThai = () => {
        if (mapRef) {
            mapRef.current?.stop();
            mapRef.current?.flyTo({ center: [100.9, 13.18], zoom: 4.8, duration: 2000, essential: true });
        }
    };

    const fnResetMap = () => {
        if (mapRef) {
            mapRef.current?.stop();
            mapRef.current?.flyTo({ center: [-100, 40], zoom: 1, duration: 2000, essential: true });
        }
    };

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
                onLeave: () => {
                    fnResetMap();
                    setScene(null);
                },
                onLeaveBack: () => {
                    fnResetMap();
                    setScene(null);
                },
            });

            const steps = gsap.utils.toArray<HTMLElement>(".story-step");
            setStepLength(steps.length);

            steps.forEach((step, index) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => setScene(index),
                    onEnterBack: () => setScene(index),
                });
            });

            ScrollTrigger.refresh();
        }, rootRef);

        return () => {
            ctx.revert();
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        if (scene === 0) {
            fnFlyToThai();
        }

        console.log(scene);
    }, [scene]);

    return (
        <div ref={rootRef} className="bg-slate-950 text-white min-h-screen w-full">
            <div className="container mx-auto px-50">
                <section className="w-full py-20 relative">
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-black sm:text-7xl">
                            AGRICULTURAL
                            <span className="block text-[#13bf50]">STATISTICS</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-white/70">ระบบแสดงข้อมูลสถิติทางการเกษตรผ่านเทคโนโลยีแผนที่</p>
                    </div>

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
                </section>

                {/* SCROLLY LAYOUT */}
                <section className="scrolly mx-auto px-6">
                    <div className="grid grid-cols-2 gap-10">
                        {/* PIN DIV */}
                        <div className="stage">
                            <div className="flex flex-col gap-4 pt-5">
                                <div className="relative">
                                    <div className="mt-2 text-2xl font-bold">ภาพรวมระบบ</div>
                                </div>

                                {/* MAP PANEL */}
                                <div className="relative h-150 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/30 pointer-events-none">
                                    <HomePage ref={mapRef} />
                                </div>

                                <div className="flex justify-center items-center gap-2">
                                    {Array.from({ length: step_length }).map((_, i) => (
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

                        <div>
                            <div className="story-step h-[120vh] flex items-center">
                                <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">INTRO</div>

                                    <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                    <p className="mt-3 text-white/70">
                                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus!
                                        Reprehenderit odit possimus natus.
                                    </p>

                                    <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                </div>
                            </div>
                            <div className="story-step h-[120vh] flex items-center">
                                <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">INTRO</div>

                                    <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                    <p className="mt-3 text-white/70">
                                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus!
                                        Reprehenderit odit possimus natus.
                                    </p>

                                    <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                </div>
                            </div>
                            <div className="story-step h-[120vh] flex items-center">
                                <div className="rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">INTRO</div>

                                    <h2 className="mt-2 text-3xl font-bold">TITLE</h2>

                                    <p className="mt-3 text-white/70">
                                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus!
                                        Reprehenderit odit possimus natus.
                                    </p>

                                    <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="flex justify-center py-20">
                    <button
                        onClick={() => navigate("/home")}
                        className="px-10 py-5 rounded-lg font-semibold cursor-pointer bg-[#1E293B] hover:scale-105 duration-200"
                    >
                        เข้าสู่เว็บไซต์
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
