import dayjs from "dayjs";
import { TbClockCheck } from "react-icons/tb";
import { Popup } from "react-map-gl/maplibre";
import type { LocationType } from "types";

type PropsType = {
    data: LocationType;
};

function PricePopup({ data }: PropsType) {
    return (
        <Popup latitude={data.location.lat} longitude={data.location.lng} closeButton={false} offset={15}>
            <div className="flex flex-col items-center justify-center overflow-hidden">
                <div className="font-bold text-sm text-[#52796F]">{data.name}</div>
                <div className="flex flex-col mt-2 w-full">
                    {data.productList.map((product, index) => (
                        <div className="flex flex-col">
                            <div className="text-xs text-black" key={index}>
                                {product.name}{" "}
                                <span className="font-bold">
                                    {product.price} {product.unit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center gap-1 w-full border-t border-t-[#E7E3E3] pt-2 mt-4 text-[#9CA3AF]">
                    <TbClockCheck />
                    <span>ข้อมูลล่าสุด {dayjs(data.productList[0].data_date).format("DD-MM-YYYY")}</span>
                </div>
            </div>
        </Popup>
    );
}

export default PricePopup;
