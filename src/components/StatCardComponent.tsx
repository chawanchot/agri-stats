import { FaMapLocationDot } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";
import { TbMapSearch, TbReportAnalytics } from "react-icons/tb";

const stats_card_data = [
    {
        icon: <PiPlantFill className="text-3xl text-emerald-400" />,
        value: "5",
        label: "ชนิดพืช",
        sub: "ยางพารา มันสำปะหลัง ปาล์ม ข้าวโพด ลำไย",
    },
    {
        icon: <FaMapLocationDot className="text-3xl text-emerald-400" />,
        value: "77",
        label: "จังหวัด",
        sub: "ครอบคลุมทั่วประเทศ",
    },
    {
        icon: <TbReportAnalytics className="text-3xl text-emerald-400" />,
        value: "2563-2567",
        label: "ช่วงปีข้อมูล",
        sub: "ข้อมูลผลผลิต 5 ปีย้อนหลัง",
    },
    {
        icon: <TbMapSearch className="text-3xl text-emerald-400" />,
        value: "60+",
        label: "ข้อมูลดินรายจังหวัด",
        sub: "กลุ่มชุดดิน & สมบัติดิน",
    },
];

function StatCardComponent() {
    return (
        <div className="w-full mb-20">
            <div className="text-center mb-10">
                <h2 className="text-2xl lg:text-4xl font-bold">ข้อมูลในระบบ</h2>
                <p className="mt-2 text-sm text-white/50">
                    ข้อมูลสถิติการเกษตรของประเทศไทยและราคาผลผลิตรวบรวมจากศูนย์ข้อมูลเกษตรแห่งชาติ (NABC)
                    และชุดกลุ่มข้อมูลดินจากสำนักงานพัฒนารัฐบาลดิจิทัล
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats_card_data.map((stat, index) => (
                    <div
                        key={index}
                        className="rounded-2xl bg-white/5 p-5 flex flex-col gap-3 hover:bg-white/[0.07] transition-colors duration-300"
                    >
                        <div className="flex items-center justify-between h-full">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                {stat.icon}
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-emerald-400">{stat.value}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold mt-1">{stat.label}</div>
                            <div className="text-xs text-white/40 mt-0.5">{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StatCardComponent;
