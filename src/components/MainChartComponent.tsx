import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hook";
import type { CropDetailType } from "types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { fnExitMainChart } from "@utils/crops";
import CompareModeComponent from "./CompareModeComponent";
import clsx from "clsx";

const MainChartComponent = () => {
    const [chartData, setChartData] = useState<{ province: string; value: number }[]>([]);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [unit, setUnit] = useState<string>("");
    const dispatch = useAppDispatch();
    const is_landing = useAppSelector((state) => state.control.isLanding);

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
                    className={clsx(
                        "absolute right-2 top-2 z-10 w-40 pb-2 h-[50%] rounded-xl overflow-hidden flex flex-col bg-[#131b2e] shadow-2xl",
                        !is_landing && "lg:right-4 lg:top-5 lg:h-[94%] lg:w-80"
                    )}
                >
                    <div
                        className={clsx("px-3 pt-4 pb-2 flex justify-between items-center", !is_landing && "lg:px-5 lg:pb-4")}
                    >
                        <div>
                            <div className={clsx("text-xs text-white", !is_landing && "lg:text-base")}>ผลผลิตรายจังหวัด</div>
                            <div className={clsx("text-[8px] text-[#64748b] mt-0.5", !is_landing && "lg:text-sm")}>
                                {chartData.length} จังหวัด - {unit}
                            </div>
                        </div>
                        <button
                            onClick={() => fnExitMainChart(dispatch)}
                            className={clsx(
                                "w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center transition-all duration-200 cursor-pointer",
                                !is_landing && "lg:w-8 lg:h-8"
                            )}
                        >
                            <FiX className={clsx("text-[#94a3b8] text-[10px]", !is_landing && "lg:text-base")} />
                        </button>
                    </div>
                    <div className={clsx("px-3 pb-2 block", !is_landing && "lg:px-4 lg:hidden")}>
                        <CompareModeComponent />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chartData.map((item, index) => {
                            if (item.value > 0)
                                return (
                                    <div
                                        key={index}
                                        className={clsx(
                                            "px-3 py-1 border-t border-[#1e293b] hover:bg-[#1e293b] transition-colors cursor-pointer",
                                            !is_landing && "lg:px-4 lg:py-3"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={clsx("text-[8px] text-white", !is_landing && "lg:text-sm")}>
                                                {item.province}
                                            </span>
                                            <span
                                                className={clsx(
                                                    "text-[8px] font-medium text-teal-400",
                                                    !is_landing && "lg:text-sm"
                                                )}
                                            >
                                                {item.value.toLocaleString()} {unit}
                                            </span>
                                        </div>

                                        <div
                                            className={clsx(
                                                "w-full h-3 bg-[#1e293b] rounded overflow-hidden",
                                                !is_landing && "lg:h-6 lg:rounded-lg"
                                            )}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.03 }}
                                                className={clsx("h-full bg-[#10B981] rounded", !is_landing && "lg:rounded-lg")}
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
