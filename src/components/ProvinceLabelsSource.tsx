import type { FeatureCollection } from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";

type PropsType = {
    data: FeatureCollection;
};

function ProvinceLabelsSource({ data }: PropsType) {
    const LabelPoints: FeatureCollection = {
        type: "FeatureCollection",
        features: data.features.map((feature: any) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    feature.properties.province_lon,
                    feature.properties.province_lat,
                ],
            },
            properties: feature.properties,
        })),
    };

    return (
        <Source id="provinceLabelsSource" type="geojson" data={LabelPoints}>
            <Layer
                id="province-labels"
                type="symbol"
                minzoom={4}
                layout={{
                    "text-field": ["get", "pro_th"],
                    "text-font": [
                        "Open Sans Regular",
                        "Arial Unicode MS Regular",
                    ],
                    "text-size": 14,
                }}
                paint={{
                    "text-color": "#ffffff",
                    "text-halo-color": "#4f4f4f",
                    "text-halo-width": 1,
                }}
            />
        </Source>
    );
}

export default ProvinceLabelsSource;
