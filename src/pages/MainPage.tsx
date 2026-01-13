import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import durian from "@assets/durian.png";
import sweetcorn from "@assets/sweetcorn.png";
import longan from "@assets/longan.png";
import rambutan from "@assets/rambutan.png";
import mangosteen from "@assets/mangosteen.png";
import lemon from "@assets/lemon.png";
import coconut from "@assets/coconut.png";
import tangerine from "@assets/tangerine.png";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white selection:bg-green-100">
      <style>{`
        @keyframes soft-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .responsive-title {
          font-size: clamp(2.5rem, 10vw, 9rem);
          line-height: 1;
        }
        .responsive-subtitle {
          font-size: clamp(3rem, 12vw, 11rem);
          line-height: 0.85;
        }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-95 filter saturate-[1.1] brightness-[1.05] contrast-[1.05]">
        <Map
          initialViewState={{
            longitude: 101.2,
            latitude: 13.5,
            zoom: 5.6,
          }}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactive={false}
          attributionControl={false}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-linear-to-b from-white/30 via-transparent to-white/20" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.2)_100%)]" />

      <div className="relative z-30 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="relative mb-8 w-full max-w-6xl">
          <img
            src={lemon}
            className="absolute w-[12vw] max-w-17.5 -top-5 right-[8%] md:right-[0%] animate-[soft-float_6s_ease-in-out_infinite] rotate-[-10deg] drop-shadow-xl pointer-events-none"
          />
          <img
            src={sweetcorn}
            className="absolute w-[12vw] max-w-17.5 -top-12 left-[8%] md:left-[0%] animate-[soft-float_6s_ease-in-out_infinite] rotate-[-10deg] drop-shadow-xl pointer-events-none"
          />
          <img
            src={coconut}
            className="absolute w-[15vw] max-w-25 top-28 right-[5%] md:right-[-5%] animate-[soft-float_8s_ease-in-out_infinite] opacity-90 drop-shadow-xl pointer-events-none"
          />
          <img
            src={tangerine}
            className="absolute w-[15vw] max-w-25 top-28 left-[5%] md:left-[-5%] animate-[soft-float_8s_ease-in-out_infinite] opacity-90 drop-shadow-xl pointer-events-none"
          />
          <img
            src={longan}
            className="absolute w-[15vw] max-w-25 -bottom-3 right-[8%] md:right-[0%] animate-[soft-float_8s_ease-in-out_infinite] opacity-90 drop-shadow-xl pointer-events-none"
          />
          <img
            src={mangosteen}
            className="absolute w-[15vw] max-w-25 -bottom-3 left-[8%] md:left-[2%] animate-[soft-float_8s_ease-in-out_infinite] opacity-90 drop-shadow-xl pointer-events-none"
          />

          <h1 className="select-none font-black tracking-tighter uppercase mb-2 md:mb-4 drop-shadow-md">
            <span className="block responsive-title text-white">
              Agricultural
            </span>
            <span className="block responsive-subtitle bg-linear-to-r from-[#d9f99d] via-[#a3e635] to-[#84bd22] bg-clip-text text-transparent">
              Statistics
            </span>
          </h1>
        </div>

        <div
          className="flex flex-col items-center gap-5 w-full max-w-5xl p-7 md:p-9 rounded-[2.5rem] 
        bg-white/10 backdrop-blur-md border border-white/20 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] transition-all hover:bg-white/15"
        >
          <p className="text-white text-lg md:text-1xl font-light tracking-wide leading-relaxed drop-shadow-sm whitespace-nowrap md:whitespace-normal uppercase">
            A system for displaying{" "}
            <span className="font-semibold text-green-300">
              agricultural statistics
            </span>{" "}
            using mapping technology.
          </p>

          <div className="h-px w-24 bg-linear-to-r from-transparent via-white/40 to-transparent" />

          <p className="text-white/70 text-[10px] md:text-[13px] uppercase font-medium tracking-[0.25em] leading-relaxed">
            ระบบแสดงข้อมูลสถิติทางการเกษตรผ่านเทคโนโลยีแผนที่
          </p>
        </div>

        <div className="mt-10 group relative">
          <div className="absolute -inset-1 bg-green-300 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
          <Button
            type="primary"
            className="relative h-14 md:h-16 px-16 bg-white! text-[#1a2e05]! hover:bg-green-50! hover:scale-105 border-none rounded-full text-base md:text-lg font-black tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center gap-3"
            onClick={() => navigate("/home")}
          >
            เข้าสู่เว็บไซต์
          </Button>
        </div>
      </div>

      <img
        src={durian}
        className="absolute z-40 w-[22vw] max-w-60 bottom-4 left-[8%] animate-[soft-float_10s_ease-in-out_infinite] rotate-6 opacity-95 drop-shadow-2xl pointer-events-none"
      />
      <img
        src={rambutan}
        className="absolute z-40 w-[22vw] max-w-40 bottom-15 right-[10%] animate-[soft-float_10s_ease-in-out_infinite] rotate-6 opacity-95 drop-shadow-2xl pointer-events-none"
      />
    </div>
  );
};

export default MainPage;
