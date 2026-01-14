import type { FeatureCollection } from "geojson";
import { Layer, Source } from "react-map-gl/maplibre";

type PropsType = {
    data: FeatureCollection;
};

const ProvinceLabelsLayer = ({ data }: PropsType) => {
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
                    "text-font": ["Kanit"],
                    "text-size": 14,
                }}
                paint={{
                    "text-color": "#ffffff",
                    "text-opacity": 1,
                    "text-halo-color": "#242323",
                    "text-halo-width": 1,
                }}
            />
        </Source>
    );
}

export default ProvinceLabelsLayer;
