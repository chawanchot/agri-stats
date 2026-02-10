import { Popup } from "react-map-gl/maplibre";

type PropsType = {
    data: any;
};

function SoilPopup({ data }: PropsType) {
    return (
        <Popup longitude={data.longitude} latitude={data.latitude} offset={15} closeButton={false}>
            <div className="flex flex-col items-center justify-center">
                <div className="font-bold text-sm text-[#52796F]">ตำบล: {data.properties.tam_nam_t}</div>
                <div className="mt-2 text-xs text-black">
                    pH: <span className="font-bold">{data.properties.pH_avg || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="flex justify-center items-center border-t border-t-[#E7E3E3] pt-2 mt-2 text-[#9CA3AF]">
                    ค่า pH ของดินโดยเฉลี่ย
                </div>
            </div>
        </Popup>
    );
}

export default SoilPopup;
