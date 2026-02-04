import { useEffect, useState } from "react";
import { useAppSelector } from "@store/hook";
import type { CropDetailType } from "types";
import { motion, AnimatePresence } from "framer-motion";

function MainChartComponent() {
    const [chartData, setChartData] = useState<{ province: string; value: number }[]>([]);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [unit, setUnit] = useState<string>("");

    const menuSelected = useAppSelector((state) => state.control.menu);
    const cropCompareData = useAppSelector((state) => state.crop.cropMainChart);
    const provincesFilter: string[] = useAppSelector((state) => state.control.mainChartFilter);

    useEffect(() => {
        if (cropCompareData.length > 0 && provincesFilter.length > 0) {
            const filtered = cropCompareData.filter((item: any) => provincesFilter.includes(item.province));

            if (menuSelected.type === "ผลผลิตต่อไร่") {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_per_rai - a.yield_per_rai);
                const data = sorted.map((item: CropDetailType) => ({
                    province: item.province,
                    value: item.yield_per_rai,
                }));
                setChartData(data);
                setMaxValue(Math.max(...data.map((d) => d.value)));
                setUnit("กก./ไร่");
            } else {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_ton - a.yield_ton);
                const data = sorted.map((item: CropDetailType) => ({
                    province: item.province,
                    value: item.yield_ton,
                }));
                setChartData(data);
                setMaxValue(Math.max(...data.map((d) => d.value)));
                setUnit("ตัน");
            }
        } else {
            setChartData([]);
            setMaxValue(0);
        }
    }, [cropCompareData, menuSelected.type, provincesFilter]);

    if (chartData.length > 0) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-4 top-20 bottom-4 z-10 w-80 rounded-3xl overflow-hidden flex flex-col bg-[#131b2e] shadow-2xl"
                >
                    <div className="px-5 py-4">
                        <h3 className="text-base font-medium text-white">ผลผลิตรายจังหวัด</h3>
                        <p className="text-sm text-[#64748b] mt-0.5">
                            {chartData.length} จังหวัด • {unit}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {chartData.map((item, index) => (
                            <div
                                key={index}
                                className="px-4 py-3 border-t border-[#1e293b] hover:bg-[#1e293b] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white">{item.province}</span>
                                    <span className="text-sm font-medium text-teal-400">
                                        {item.value.toLocaleString()} {unit}
                                    </span>
                                </div>
                                <div className="w-full h-6 bg-[#1e293b] rounded-lg overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / maxValue) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.03 }}
                                        className="h-full bg-[#10B981] rounded-lg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }
}

export default MainChartComponent;
