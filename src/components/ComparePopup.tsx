import { Popup } from "react-map-gl/maplibre";

type PropsType = {
    data: any;
    type: string;
};

function ComparePopup({ data, type }: PropsType) {
    return (
        <Popup latitude={data.lat} longitude={data.lng} offset={15} closeButton={false}>
            <div className="flex flex-col items-center justify-center">
                <div className="font-bold text-sm text-[#52796F]">{data.properties.pro_th}</div>
                <div className="mt-2 text-xs text-black">
                    ผลผลิตเฉลี่ย:{" "}
                    {type === "ผลผลิตต่อไร่" ? (
                        <span className="font-bold">{data.properties.yield_per_rai.toLocaleString()} กก./ไร่</span>
                    ) : (
                        <span className="font-bold">{data.properties.yield_ton.toLocaleString()} ตัน</span>
                    )}
                </div>
            </div>
        </Popup>
    );
}

export default ComparePopup;
