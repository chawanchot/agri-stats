import { Layer, Source } from "react-map-gl/mapbox"
import type { FeatureCollection } from "geojson";

const HeadMapCrop = ({ data }: { data: FeatureCollection }) => {
    return (
        <Source id="provinces-source" type="geojson" data={data}>
            <Layer
                id="province-fills"
                type="fill"
                paint={{
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["get", "yield_weight"],
                        0, "#f2f0f7",         
                        50, "#FDEBD0",        
                        100, "#F7CAC9",
                        150, "#F75270",
                        200, "#DC143C"      
                    ],
                    "fill-opacity": 0.7,
                }}
            />
        </Source>
    )
}

export default HeadMapCrop