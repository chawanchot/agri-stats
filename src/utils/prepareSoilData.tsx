import type { FeatureCollection, Feature } from "geojson";

type AnyProps = Record<string, any>;

function fnGetPhAverage(input: string): number {
    if (typeof input !== "string") return 0;

    const cleaned = input.trim().replace(" ", "");
    const parts = cleaned.split("-");

    if (parts.length !== 2) return 0;

    const min = Number(parts[0]);
    const max = Number(parts[1]);
    const avg = (min + max) / 2;

    return avg;
}

export function fnDataWithPhNumbers(fc: FeatureCollection): FeatureCollection {
    return {
        ...fc,
        features: fc.features.map((f: Feature) => {
            const props = (f.properties ?? {}) as AnyProps;
            const avg = fnGetPhAverage(props.pH_top);
            return {
                ...f,
                properties: {
                    ...props,
                    pH_avg: avg,
                },
            };
        }),
    };
}
