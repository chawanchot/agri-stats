import { Layer, Source } from "react-map-gl/maplibre";
import { useAppSelector } from "@store/hook";
import ComparePopup from "@components/ComparePopup";

type PropsType = {
    hoverData: any;
    type: string;
};

const COMPARE_COLORS = ["#F1F3E0", "#D2DCB6", "#A1BC98", "#778873", "#63A361"] as const;
const LEGEND = [
    { color: COMPARE_COLORS[4], label: "สูงมาก" },
    { color: COMPARE_COLORS[3], label: "สูง" },
    { color: COMPARE_COLORS[2], label: "ปานกลาง" },
    { color: COMPARE_COLORS[1], label: "ต่ำ" },
    { color: COMPARE_COLORS[0], label: "ต่ำมาก" },
    { color: "rgba(0,0,0,0)", label: "0 / ไม่มีข้อมูล" },
] as const;

const CropCompareLayer = ({ hoverData, type }: PropsType) => {
    const cropCompareData: any = useAppSelector((state) => state.crop.cropCompareData);

    const findDynamicColorRange = () => {
        if (!cropCompareData?.features || cropCompareData.features.length === 0) {
            return [0, "#f2f0f7"];
        }

        const field = type === "ผลผลิตต่อไร่" ? "yield_per_rai" : "yield_ton";

        const values = cropCompareData.features.map((feature: any) => feature.properties[field]);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const step = (max - min) / 4;

        return [
            min,
            COMPARE_COLORS[0],
            min + step,
            COMPARE_COLORS[1],
            min + step * 2,
            COMPARE_COLORS[2],
            min + step * 3,
            COMPARE_COLORS[3],
            max,
            COMPARE_COLORS[4],
        ];
    };

    return (
        <>
            <Source id="provinces-source" type="geojson" data={cropCompareData}>
                <Layer
                    id="province-compare-fills"
                    type="fill"
                    beforeId="province-labels"
                    paint={{
                        "fill-color": [
                            "case",
                            ["==", ["get", type === "ผลผลิตต่อไร่" ? "yield_per_rai" : "yield_ton"], 0],
                            "rgba(0,0,0,0)",
                            [
                                "interpolate",
                                ["linear"],
                                ["get", type === "ผลผลิตต่อไร่" ? "yield_per_rai" : "yield_ton"],
                                ...findDynamicColorRange(),
                            ],
                        ],
                        "fill-opacity": 0.7,
                    }}
                />
                {hoverData && <ComparePopup data={hoverData} type={type} />}
            </Source>
            <div className="absolute left-20 bottom-4 z-20 w-64 rounded-2xl bg-[#131b2d] px-4 py-3 text-white drop-shadow font-['Noto_Sans_Thai']">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">ระดับ{type}</div>
                </div>
                <div className="text-[11px] text-white/60">คำนวณตามข้อมูลที่แสดงแบ่งเป็น 5 ระดับ</div>
                <div className="mt-3 space-y-2">
                    {LEGEND.map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                            <span className="mt-0.5 h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                            <div className="leading-tight">
                                <div className="text-xs font-semibold">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CropCompareLayer;
