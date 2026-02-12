import { useAppDispatch, useAppSelector } from "@store/hook";
import { setMenuSelected } from "@store/slice/controlSlice";
import { Segmented } from "antd";
import clsx from "clsx";

const CompareModeComponent = () => {
    const crop_compare_selected = useAppSelector((state) => state.control.menu);
    const dispatch = useAppDispatch();
    const is_landing = useAppSelector((state) => state.control.isLanding);

    return (
        <div className={clsx("flex flex-col gap-1", !is_landing && "md:gap-2")}>
            <label className={clsx("text-[8px] text-[#94a3b8]", !is_landing && "md:text-xs")}>ประเภทข้อมูล</label>
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
                    root: "bg-[#1e293b]! drop-shadow py-0!",
                    label: clsx(
                        "text-[8px] p-0! min-h-5! max-h-5! flex! justify-center items-center",
                        !is_landing && "md:text-sm md:min-h-8! md:max-h-8!"
                    ),
                }}
            />
        </div>
    );
};

export default CompareModeComponent;
