import { Layer, Popup, Source } from "react-map-gl/mapbox";
import type { FeatureCollection } from "geojson";

type PropsType = {
    data: FeatureCollection;
    hoverData: any;
};

function SoilSource({ data, hoverData }: PropsType) {
    return (
        <Source id="soil-layer" type="geojson" data={data}>
            <Layer
                id="soil-fill"
                type="fill"
                paint={{
                    "fill-color": [
                        "match",
                        ["get", "pH_top"],
                        "4.5-5.5",
                        "#ff9999",
                        "5.5-7.0",
                        "#99ff99",
                        "#cccccc",
                    ],
                    "fill-opacity": 0.7,
                }}
            />
            {hoverData && (
                <Popup
                    longitude={hoverData.longitude}
                    latitude={hoverData.latitude}
                    closeButton={false}
                >
                    <div className="text-black p-1">
                        ตำบล: {hoverData.properties.tam_nam_t} <br />
                        pH: {hoverData.properties.pH_top}
                    </div>
                </Popup>
            )}
        </Source>
    );
}

export default SoilSource;
