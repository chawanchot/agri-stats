import { FcHighPriority } from "react-icons/fc";
import { TbChartBar } from "react-icons/tb";

const Header = () => {
    return (
        <header className="bg-[#0f172a] text-white px-3 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-[#10b981] p-2 rounded-lg hidden md:flex">
                    <TbChartBar className="w-6 h-6 text-[#f1f5f9]" />
                </div>
                <div>
                    <div className="text-xs md:text-lg font-semibold tracking-wide">AGRICULTURAL STATISTICS</div>
                    <div className="text-xs text-gray-400">ข้อมูลสถิติทางการเกษตร</div>
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
