import MainRouter from "@router/MainRouter";
import { useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";
import { useEffect } from "react";
import { useAppDispatch } from "@store/hook";
import { setIsLanding } from "@store/slice/controlSlice";

const antTheme = {
    components: {
        Cascader: {
            optionSelectedBg: "#10b981",
        },
        Segmented: {
            itemHoverColor: "#94A3B8",
            itemActiveBg: "#334155",
            itemSelectedBg: "#334155",
            itemSelectedColor: "#10B981",
        },
        Tree: {
            nodeSelectedBg: "transparent",
            nodeHoverBg: "transparent",
        },
    },
};

function App() {
    const { pathname } = useLocation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setIsLanding(pathname === "/" || pathname === "/agri-stats/"));
    }, [pathname, dispatch]);

    return (
        <ConfigProvider theme={antTheme}>
            <MainRouter />
        </ConfigProvider>
    );
}

export default App;
