import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { FaArrowDown, FaArrowRightLong } from "react-icons/fa6";
import { useAppDispatch } from "@store/hook";
import { fnExitMainChart, fnFetchCropCompareData } from "@utils/fetchCrops";
import { setMenuSelected } from "@store/slice/controlSlice";

gsap.registerPlugin(ScrollTrigger);

function Model() {
    const gltf = useGLTF(`${import.meta.env.BASE_URL}/models/stylized_mangrove_greenhouse.glb`);
    return (
        <Float speed={1.4} rotationIntensity={1.2} floatIntensity={0.6}>
            <primitive object={gltf.scene} scale={0.1} position={[0, 0, 0]} />
        </Float>
    );
}

useGLTF.preload(`${import.meta.env.BASE_URL}/models/stylized_mangrove_greenhouse.glb`);

const storyData = [
    {
        tag: "FEATURE",
        title: "แสดงแผนที่ประเทศไทย",
        description: "ซูม/เลื่อนเพื่อดูภาพรวมทั้งประเทศ พร้อมเลเยอร์ประกอบเพื่อสำรวจข้อมูลเชิงพื้นที่ได้อย่างรวดเร็ว",
    },
    {
        tag: "FEATURE",
        title: "เปรียบเทียบผลผลิตรายจังหวัด",
        description: "เลือกพืชและปี แล้วดูการกระจายของผลผลิต (เช่น กก./ไร่) บนแผนที่ เพื่อให้เห็นจังหวัดเด่น ๆ ทันที",
    },
    {
        tag: "FEATURE",
        title: "ตรวจสอบราคารับซื้อผลผลิต",
        description: "ดูจุดรับซื้อ/ราคาตามพื้นที่ ช่วยประเมินแนวโน้มและวางแผนได้ดีขึ้น",
    },
] as const;

const LandingPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapRef>(null);
    const modelWrapRef = useRef<HTMLDivElement | null>(null);
    const headerWrapRef = useRef<HTMLDivElement | null>(null);
    const [scene, setScene] = useState<number | null>(null);

    const stepCount = storyData.length;

    const fnFlyToThai = () => {
        if (mapRef) {
            mapRef.current?.stop();
            mapRef.current?.flyTo({ center: [100.9, 13.18], zoom: 4.8, duration: 1500, essential: true });
        }
    };

    const fnResetMap = () => {
        if (mapRef) {
            mapRef.current?.stop();
            mapRef.current?.flyTo({ center: [-100, 40], zoom: 1, duration: 1500, essential: true });
        }
    };

    const applySceneAction = (scene: number | null) => {
        fnExitMainChart(dispatch);
        dispatch(setMenuSelected({ crop: "", mode: "", year: "" }));

        if (scene === 1) {
            fnFlyToThai();
            fnFetchCropCompareData("ยางพารา", "2566", dispatch);
        }

        if (scene === 2) {
            dispatch(setMenuSelected({ crop: "ยางพารา", mode: "ราคา" }));
            mapRef.current?.flyTo({ center: [101.43, 12.77], zoom: 8, duration: 1500, essential: true });
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
                onEnter: () => {
                    setScene(0);
                    fnFlyToThai();
                },
                onEnterBack: () => {
                    fnFlyToThai();
                },
                onLeave: () => {
                    fnResetMap();
                    setScene(null);
                },
                onLeaveBack: () => {
                    fnResetMap();
                    setScene(null);
                },
                onUpdate: (self) => {
                    const p = self.progress;

                    const newScene = Math.min(Math.floor(p * stepCount), stepCount - 1);
                    setScene((prev) => (prev !== newScene ? newScene : prev));
                },
            });

            gsap.to(modelWrapRef.current, {
                xPercent: 200,
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: ".container",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                },
            });

            gsap.to(headerWrapRef.current, {
                xPercent: -200,
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: ".container",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                },
            });
            ScrollTrigger.refresh();
        }, rootRef);

        return () => {
            ctx.revert();
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, [stepCount]);

    useEffect(() => {
        applySceneAction(scene);
    }, [scene]);

    return (
        <div ref={rootRef} className="bg-slate-950 text-white w-full">
            <div className="container mx-auto px-5 lg:px-50 overflow-hidden">
                <section className="w-full h-screen py-0 lg:py-20 relative flex flex-col justify-center items-center lg:block">
                    <div className="absolute top-4 right-0 lg:right-6 z-10 flex items-center gap-2">
                        <button
                            onClick={() => navigate("/home")}
                            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm font-semibold cursor-pointer"
                        >
                            ข้ามไปหน้าแผนที่
                        </button>
                    </div>

                    <div ref={headerWrapRef} className="flex flex-col justify-center lg:h-full">
                        <h1 className="text-4xl md:text-7xl font-black">
                            AGRICULTURAL
                            <span className="block text-[#13bf50]">STATISTICS</span>
                        </h1>
                        <p className="mt-4 text-white/70 lg:w-1/2 text-xs md:text-sm">
                            ระบบแสดงข้อมูลสถิติทางการเกษตรผ่านเทคโนโลยีแผนที่ สำรวจผลผลิต เปรียบเทียบพื้นที่ และดูราคาแบบภาพรวม
                        </p>
                    </div>

                    <div
                        ref={modelWrapRef}
                        className="w-96 h-96 md:w-145 md:h-145 lg:h-200 lg:w-200 -mt-14 md:-mt-28 lg:mt-0 lg:absolute lg:top-[43%] lg:left-[80%] lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2"
                    >
                        <Canvas camera={{ position: [7.6, 1.8, 3.2], fov: 45 }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[3, 4, 2]} intensity={1.2} />
                            <Environment preset="city" />
                            <Bounds fit margin={1.2}>
                                <Model />
                            </Bounds>
                        </Canvas>
                    </div>
                    <div className="text-[#81838B] text-xs tracking-[4px] flex flex-col items-center gap-2 animate-bounce">
                        <div>SCROLL DOWN</div>
                        <FaArrowDown />
                    </div>
                </section>

                {/* SCROLLY LAYOUT */}
                <section className="scrolly h-[400vh] lg:h-[600vh]">
                    <div className="pinned-content h-screen flex items-center">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-8 w-full px-0 lg:px-6">
                            <div className="stage">
                                <div className="flex flex-col gap-4">
                                    <div className="relative flex items-center justify-between">
                                        <div className="text-xl lg:text-2xl font-bold">ภาพรวมระบบ</div>
                                    </div>

                                    <div className="relative h-150 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/30 pointer-events-none">
                                        <HomePage ref={mapRef} isLandingPage={true} />
                                    </div>

                                    <div className="flex justify-center items-center gap-2">
                                        {storyData.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    scene === index ? "bg-[#13bf50] w-6" : "bg-white/20 w-2"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

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
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-xs font-semibold uppercase tracking-widest text-lime-300/90">
                                                        {storyData[scene].tag}
                                                    </div>
                                                </div>
                                            </div>

                                            <h2 className="mt-1 lg:mt-3 text-2xl lg:text-3xl font-bold">{storyData[scene].title}</h2>
                                            <p className="mt-1 lg:mt-3 text-xs lg:text-sm text-white/70">{storyData[scene].description}</p>

                                            <div className="mt-5 lg:mt-8 flex items-center gap-3">
                                                <div className="text-[#81838B] text-xs flex items-center gap-2">
                                                    <div>SCROLL DOWN</div>
                                                    <FaArrowDown />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col items-center gap-2 justify-center py-20">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex justify-center items-center gap-3 py-4 w-56 rounded-full font-semibold cursor-pointer bg-[#13bf50] hover:scale-105 duration-300"
                    >
                        เข้าสู่เว็บไซต์
                        <span>
                            <FaArrowRightLong className="text-lg" />
                        </span>
                    </button>
                    <div className="text-xs text-white/50">พร้อมใช้งานหน้าหลักและเมนูเปรียบเทียบ</div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
