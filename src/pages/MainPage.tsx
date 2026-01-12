import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import baimaiImg from "@assets/baimai.png";
import baimai2Img from "@assets/baimai2.png";
import baimai3Img from "@assets/baimai3.png";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#ffffff] selection:bg-green-500/30">
            <style>{`
        @keyframes custom-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5)); }
        }
        @keyframes custom-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>

            <div className="absolute inset-0 z-0 opacity-60">
                <Map
                    initialViewState={{
                        longitude: 100.5,
                        latitude: 13.7,
                        zoom: 5.2,
                    }}
                    mapStyle="mapbox://styles/mapbox/satellite-v9"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactive={false}
                    attributionControl={false}
                ></Map>
            </div>

            <div className="absolute inset-0 z-10 bg-linear-to-b from-black/60 via-transparent to-black/80" />
            <div className="relative z-30 flex flex-col items-center justify-center h-full text-center px-4">
                <div className="relative mb-4">
                    <img
                        src={baimai3Img}
                        className="absolute w-24 bottom-[15%] right-[8%] animate-[custom-float_7s_ease-in-out_infinite] [animation-delay:2s] rotate-150 opacity-80 "
                        alt="leaf-deco"
                    />
                    <h1
                        className="select-none leading-none font-black tracking-tighter 
                       text-[12vw] md:text-[240px] lg:text-[200px]
                       bg-[url('https://i.pinimg.com/1200x/17/a2/69/17a269c21c1dd8116ac2e139ae0be556.jpg')] 
                       bg-contain bg-center bg-fixed bg-clip-text text-transparent
                       [-webkit-text-stroke:1px_rgba(255,255,255,0.1)] uppercase
                       drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                    >
                        Agricultural Statistics
                    </h1>
                    <img
                        src={baimaiImg}
                        className="absolute w-16 -top-7 z-40 drop-shadow-lg right-[3%] animate-[custom-float_7s_ease-in-out_infinite] [animation-delay:2s] rotate-140"
                        alt="leaf-accent"
                    />
                </div>

                <div className="flex flex-col items-center gap-2 max-w-2xl">
                    <p className="text-white text-lg md:text-xl font-normal">
                        A System For Displaying Agricultural Statistics Using
                        Mapping Technology.
                    </p>
                    <div className="h-0.5 w-20 bg-[#5d8a11] rounded-full my-2 shadow-[0_0_15px_rgba(93,138,17,0.8)]" />
                    <p className="text-white/60 text-xs  md:text-sm uppercase font-light tracking-widest">
                        "ระบบแสดงข้อมูลสถิติทางการเกษตรผ่านเทคโนโลยีแผนที่"
                    </p>
                </div>
                <Button
                    type="primary"
                    className="mt-12 h-14 px-16 bg-[#5d8a11]! hover:bg-[#74ac15]! hover:scale-105 border-none rounded-full text-lg font-bold tracking-widest shadow-[0_10px_40px_rgba(93,138,17,0.4)] transition-all active:scale-95"
                    onClick={() => navigate("/home")}
                >
                    เข้าสู่เว็บไซต์
                </Button>
            </div>
            <img
                src={baimai2Img}
                className="absolute z-20 w-32 bottom-[35%] left-[5%] animate-[custom-float_9s_ease-in-out_infinite] [animation-delay:2s] rotate-90"
                alt="leaf-deco"
            />
        </div>
    );
};

export default MainPage;
