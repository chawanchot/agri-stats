import { useAppSelector } from "@store/hook";
import type { FeatureCollection } from "geojson";
import { Layer, Source } from "react-map-gl/maplibre";

type PropsType = {
    data: FeatureCollection;
    hoverData: any;
};

const ProvinceLayer = ({ data, hoverData }: PropsType) => {
    const province_selected = useAppSelector((state) => state.control.province);

    return (
        <>
            <Source id="provincesData" type="geojson" data={data}>
                {!province_selected && (
                    <Layer
                        id="province-hover-fills"
                        type="fill"
                        paint={{
                            "fill-color": "#088",
                            "fill-opacity": ["case", ["==", ["get", "pro_th"], hoverData], 0.5, 0.1],
                        }}
                    />
                )}

                <Layer
                    id="province-outline"
                    type="line"
                    paint={{
                        "line-color": "#fff",
                        "line-width": 1,
                        "line-opacity": 0.4,
                    }}
                />
            </Source>
        </>
    );
};

export default ProvinceLayer;
