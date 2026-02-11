import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hook";
import type { CropDetailType } from "types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { fnExitMainChart } from "@utils/fetchCrops";
import CompareModeComponent from "./CompareModeComponent";
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
                    className="absolute right-2 lg:right-4 top-2 lg:top-5 h-[50%] lg:h-[94%] z-10 w-40 pb-2 lg:w-80 rounded-xl overflow-hidden flex flex-col bg-[#131b2e] shadow-2xl"
                >
                    <div className="px-3 lg:px-5 pt-4 pb-2 lg:pb-4 flex justify-between items-center">
                        <div>
                            <div className="text-xs lg:text-base font-lg: text-white">ผลผลิตรายจังหวัด</div>
                            <div className="text-[8px] lg:text-sm text-[#64748b] mt-0.5">
                                {chartData.length} จังหวัด - {unit}
                            </div>
                        </div>
                        <button
                            onClick={() => fnExitMainChart(dispatch)}
                            className="w-5 h-5 lg:w-8 lg:h-8 rounded-full bg-[#1e293b] flex items-center justify-center transition-all duration-200 cursor-pointer"
                        >
                            <FiX className="text-base text-[#94a3b8] text-[10px] lg:text-base" />
                        </button>
                    </div>
                    <div className="px-3 lg:px-4 pb-2 block lg:hidden">
                        <CompareModeComponent />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chartData.map((item, index) => {
                            if (item.value > 0)
                                return (
                                    <div
                                        key={index}
                                        className="px-3 lg:px-4 py-1 lg:py-3 border-t border-[#1e293b] hover:bg-[#1e293b] transition-colors cursor-pointer"
                                    >
                                        {/* province text value */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[8px] lg:text-sm text-white">{item.province}</span>
                                            <span className="text-[8px] lg:text-sm font-medium text-teal-400">
                                                {item.value.toLocaleString()} {unit}
                                            </span>
                                        </div>

                                        {/* value chart bar */}
                                        <div className="w-full h-3 lg:h-6 bg-[#1e293b] rounded lg:rounded-lg overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.03 }}
                                                className="h-full bg-[#10B981] rounded lg:rounded-lg"
                                            />
                                        </div>
                                    </div>
                                );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default MainChartComponent;
