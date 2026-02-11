import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import SoilPopup from "@components/SoilPopup";
import { useMemo } from "react";
import { fnDataWithPhNumbers } from "@utils/prepareSoilData";

type PropsType = {
    data: FeatureCollection;
    hoverData: any;
};

const PH_RANGES = [
    { min: 0, max: 4.5, color: "#cccccc", label: "< 4.5", desc: "ดินเป็นกรด / ไม่มีข้อมูล" },
    { min: 4.5, max: 5.5, color: "#ff9999", label: "4.5 - 5.5", desc: "ดินค่อนข้างเป็นกรด" },
    { min: 5.5, max: 7.0, color: "#99ff99", label: "5.5 - 7.0", desc: "เหมาะกับพืชส่วนใหญ่" },
    { min: 7.0, max: 14, color: "#cccccc", label: "> 7.0", desc: "ดินเป็นด่าง" },
] as const;

const SoilLayer = ({ data, hoverData }: PropsType) => {
    const data_ph_average = useMemo(() => {
        return fnDataWithPhNumbers(data);
    }, [data]);

    return (
        <>
            <Source id="soil-layer" type="geojson" data={data_ph_average}>
                <Layer
                    id="soil-fill"
                    type="fill"
                    paint={{
                        "fill-color": [
                            "case",
                            ["!", ["has", "pH_avg"]],
                            "#cccccc",
                            [
                                "step",
                                ["get", "pH_avg"],
                                PH_RANGES[0].color,
                                PH_RANGES[1].min,
                                PH_RANGES[1].color,
                                PH_RANGES[2].min,
                                PH_RANGES[2].color,
                                PH_RANGES[3].min,
                                PH_RANGES[3].color,
                            ],
                        ],
                        "fill-opacity": 0.7,
                    }}
                />
                {hoverData && <SoilPopup data={hoverData} />}
            </Source>

            <div className="absolute left-[53%] md:left-3 bottom-[80%] md:bottom-3 z-20 w-44 md:w-64 rounded-xl md:rounded-2xl bg-[#131b2d] px-3 md:px-4 py-2 md:py-3 text-white drop-shadow font-['Noto_Sans_Thai']">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] md:text-sm font-semibold">ความเป็นกรด-ด่างของดิน (pH)</div>
                </div>
                <div className="text-[8px] md:text-[11px] text-white/60 -mt-1.5 md:mt-0">สีแต่ละระดับแสดงช่วงค่าเฉลี่ย pH ดินชั้นบน</div>
                <div className="mt-1 md:mt-3 space-y-1 md:space-y-2">
                    {PH_RANGES.map((item) => (
                        <div key={item.label} className="flex items-start gap-1.5 md:gap-3">
                            <span className="mt-0.5 h-2 w-2 md:h-4 md:w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                            <div className="leading-tight">
                                <div className="text-[8px] md:text-xs font-medium">{item.label}</div>
                                <div className="text-[8px] md:text-xs font-medium text-white/70">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SoilLayer;
