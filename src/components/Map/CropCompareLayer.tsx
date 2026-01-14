import { Layer, Popup, Source } from "react-map-gl/maplibre";
import { useAppSelector } from "@store/hook";

type PropsType = {
    hoverData: any;
    type: string;
};

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
            min, "#f2f0f7",         
            min + step, "#FDEBD0",
            min + (step * 2), "#F7CAC9",
            min + (step * 3), "#F75270",
            max, "#DC143C"
        ];
    }

    return (
        <Source id="provinces-source" type="geojson" data={cropCompareData}>
            <Layer
                id="province-compare-fills"
                type="fill"
                beforeId="province-labels"
                paint={{
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        [
                            "get",
                            type === "ผลผลิตต่อไร่"
                                ? "yield_per_rai"
                                : "yield_ton",
                        ],
                        ...findDynamicColorRange()
                    ],
                    "fill-opacity": 0.7,
                }}
            />
            {hoverData && (
                <Popup
                    latitude={hoverData.lat}
                    longitude={hoverData.lng}
                    closeButton={false}
                >
                    <div className="font-semibold">
                        {hoverData.properties.pro_th}
                    </div>
                    <div>
                        ผลผลิตเฉลี่ย:{" "}
                        {type === "ผลผลิตต่อไร่" ? (
                            <span className="font-semibold">
                                {hoverData.properties.yield_per_rai.toLocaleString()} กก./ไร่
                            </span>
                        ) : (
                            <span className="font-semibold">
                                {hoverData.properties.yield_ton.toLocaleString()} ตัน
                            </span>
                        )}
                    </div>
                </Popup>
            )}
        </Source>
    );
};

export default CropCompareLayer;
