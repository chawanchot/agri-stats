import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Environment, Float, useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
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

const storyData = [
    {
        tag: "INTRO",
        title: "ภาพรวมระบบ",
        description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore, optio necessitatibus! Reprehenderit odit possimus natus.",
    },
    {
        tag: "FEATURE",
        title: "ข้อมูลพืชผล",
        description: "ระบบแสดงข้อมูลพืชผลทางการเกษตรหลากหลายชนิด พร้อมสถิติการผลิตในแต่ละจังหวัด",
    },
    {
        tag: "EXPLORE",
        title: "สำรวจแผนที่",
        description: "สามารถเลือกดูข้อมูลดินและพืชผลในแต่ละพื้นที่ พร้อมเปรียบเทียบข้อมูลระหว่างจังหวัด",
    },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapRef>(null);
    const [scene, setScene] = useState<number | null>(null);

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
                pin: ".pinned-content",
                pinSpacing: false,
                onEnter: () => setScene(0),
                onLeave: () => {
                    fnResetMap();
                    setScene(null);
                },
                onLeaveBack: () => {
                    fnResetMap();
                    setScene(null);
                },
                onUpdate: (self) => {
                    const progress = self.progress;
                    const stepCount = storyData.length;
                    const newScene = Math.min(Math.floor(progress * stepCount), stepCount - 1);
                    setScene(newScene);
                },
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
        <div ref={rootRef} className="bg-slate-950 text-white w-full">
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
                <section className="scrolly h-[300vh]">
                    {/* PINNED CONTENT */}
                    <div className="pinned-content h-screen flex items-center">
                        <div className="grid grid-cols-2 gap-10 w-full px-6">
                            {/* MAP PANEL */}
                            <div className="stage">
                                <div className="flex flex-col gap-4">
                                    <div className="relative">
                                        <div className="text-2xl font-bold">ภาพรวมระบบ</div>
                                    </div>

                                    <div className="relative h-150 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/30 pointer-events-none">
                                        <HomePage ref={mapRef} />
                                    </div>

                                    <div className="flex justify-center items-center gap-2">
                                        {storyData.map((_, i) => (
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

                            {/* STORY TEXT - changes based on scroll */}
                            <div className="flex items-center">
                                <AnimatePresence mode="wait">
                                    {scene !== null && (
                                        <motion.div
                                            key={scene}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="rounded-3xl"
                                        >
                                            <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                                {storyData[scene].tag}
                                            </div>

                                            <h2 className="mt-2 text-3xl font-bold">{storyData[scene].title}</h2>

                                            <p className="mt-3 text-white/70">{storyData[scene].description}</p>

                                            <div className="mt-6 text-xs text-white/50">Scroll ต่อเพื่อเปลี่ยน Scene →</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
