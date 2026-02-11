import { FcHighPriority } from "react-icons/fc";

const Header = () => {
    return (
        <header className="bg-[#0f172a] text-white px-3 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2 h-full">
                <img src="agri-logo.png" alt="logo" className="w-8 md:w-12 h-auto object-contain" />
                <div>
                    <div className="text-[10px] md:text-lg font-semibold tracking-wide">AGRICULTURAL STATISTICS</div>
                    <div className="text-[8px] md:text-xs text-gray-400">ข้อมูลสถิติทางการเกษตร</div>
                </div>
            </div>
            <div className="bg-[#0C272F] border border-[#065F46] rounded-full px-2.5 py-1.5 flex items-center justify-center">
                <span className="text-[10px] md:text-sm text-[#34d399] flex items-center justify-center gap-1">
                    <FcHighPriority className="text-[10px] md:text-lg" /> ข้อมูลผลผลิต พ.ศ. 2563-2567
                </span>
            </div>
        </header>
    );
};

export default Header;
