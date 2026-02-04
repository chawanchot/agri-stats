import { TbChartBar } from "react-icons/tb";

const Header = () => {
    return (
        <header className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-[#10B981] p-2 rounded-lg">
                    <TbChartBar className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-wide">AGRICULTURAL STATISTICS</h1>
                    <p className="text-xs text-gray-400">ระบบสถิติข้อมูลการเกษตรของประเทศไทยในปัจจุบัน</p>
                </div>
            </div>
            <div className="bg-[#0C272F] border border-[#065F46] rounded-full px-4 py-1.5 flex items-center justify-center">
                <span className="text-sm text-[#34D399]">● ข้อมูลผลผลิต พ.ศ. 2563-2567</span>
            </div>
        </header>
    );
};

export default Header;
