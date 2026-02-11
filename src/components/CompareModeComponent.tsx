import { useAppDispatch, useAppSelector } from "@store/hook";
import { setMenuSelected } from "@store/slice/controlSlice";
import { Segmented } from "antd";

function CompareModeComponent() {
    const crop_compare_selected = useAppSelector((state) => state.control.menu);
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-[#94a3b8]">ประเภทข้อมูล</label>
            <Segmented
                size="middle"
                value={crop_compare_selected.type}
                options={["ผลผลิตต่อไร่", "ผลผลิตทั้งหมด"]}
                onChange={(value) =>
                    dispatch(
                        setMenuSelected({
                            type: value,
                        })
                    )
                }
                block
                className="[&_.ant-segmented-item-selected]:font-bold [&_.ant-segmented-item-selected]:drop-shadow-lg [&_.ant-segmented-item]:text-[#94a3b8]"
                classNames={{
                    root: "rounded-xl! bg-[#1e293b]! drop-shadow py-0! md:py-1!",
                    label: "text-[8px] md:text-sm p-0!"
                }}
            />
        </div>
    );
}

export default CompareModeComponent;
