import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hook";
import type { CropDetailType } from "types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { fnExitMainChart } from "@utils/fetchCrops";
function MainChartComponent() {
    const [chartData, setChartData] = useState<{ province: string; value: number }[]>([]);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [unit, setUnit] = useState<string>("");
    const dispatch = useAppDispatch();

    const menu_selected = useAppSelector((state) => state.control.menu);
    const cropCompareData = useAppSelector((state) => state.crop.cropMainChart);
    const provincesFilter: string[] = useAppSelector((state) => state.control.mainChartFilter);

    useEffect(() => {
        if (cropCompareData.length > 0 && provincesFilter.length > 0) {
            const filtered = cropCompareData.filter((item: any) => provincesFilter.includes(item.province));

            if (menu_selected.type === "ผลผลิตต่อไร่") {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_per_rai - a.yield_per_rai);
                const data = sorted.map((item: CropDetailType) => ({
                    province: item.province,
                    value: item.yield_per_rai,
                }));
                setChartData(data);
                setMaxValue(Math.max(...data.map((province) => province.value)));
                setUnit("กก./ไร่");
            } else {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_ton - a.yield_ton);
                const data = sorted.map((item: CropDetailType) => ({
                    province: item.province,
                    value: item.yield_ton,
                }));
                setChartData(data);
                setMaxValue(Math.max(...data.map((province) => province.value)));
                setUnit("ตัน");
            }
        } else {
            setChartData([]);
            setMaxValue(0);
        }
    }, [cropCompareData, menu_selected.type, provincesFilter]);

    return (
        <AnimatePresence>
            {chartData.length > 0 && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-2 md:right-4 top-2 md:top-5 h-[90%] z-10 w-80 rounded-xl overflow-hidden flex flex-col bg-[#131b2e] shadow-2xl"
                >
                    <div className="px-5 py-4 flex justify-between items-center">
                        <div>
                            <div className="text-base font-medium text-white">ผลผลิตรายจังหวัด</div>
                            <div className="text-sm text-[#64748b] mt-0.5">
                                {chartData.length} จังหวัด - {unit}
                            </div>
                        </div>
                        <button
                            onClick={() => fnExitMainChart(dispatch)}
                            className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center transition-all duration-200 cursor-pointer"
                        >
                            <FiX className="text-base text-[#94a3b8]" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {chartData.map((item, index) => (
                            <div
                                key={index}
                                className="px-4 py-3 border-t border-[#1e293b] hover:bg-[#1e293b] transition-colors cursor-pointer"
                            >
                                {/* province text value */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white">{item.province}</span>
                                    <span className="text-sm font-medium text-teal-400">
                                        {item.value.toLocaleString()} {unit}
                                    </span>
                                </div>

                                {/* value chart bar */}
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
            )}
        </AnimatePresence>
    );
}

export default MainChartComponent;
