import MainRouter from "@router/MainRouter";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";

// Ant Design Theme Configuration
const antTheme = {
    token: {
        // Primary Colors
        colorPrimary: "#10b981",
        colorPrimaryHover: "#34d399",
        colorPrimaryActive: "#059669",
        colorPrimaryBg: "#ecfdf5",
        colorPrimaryBgHover: "#d1fae5",

        // Success Colors
        colorSuccess: "#10b981",

        // Border Radius
        borderRadius: 10,
        borderRadiusLG: 14,
        borderRadiusSM: 8,

        // Font
        fontFamily: "Kanit, sans-serif",
        fontSize: 14,

        // Box Shadow
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        boxShadowSecondary: "0 2px 8px rgba(0, 0, 0, 0.06)",
    },
    components: {
        Cascader: {
            optionSelectedBg: "#ecfdf5",
            controlItemBgHover: "#f0fdf4",
        },
        Segmented: {
            itemSelectedBg: "#ffffff",
            itemSelectedColor: "#10b981",
            trackBg: "rgba(0, 0, 0, 0.04)",
        },
        Tree: {
            nodeSelectedBg: "#ecfdf5",
            nodeHoverBg: "#f0fdf4",
        },
        Tag: {
            colorSuccess: "#10b981",
            colorSuccessBg: "#ecfdf5",
            colorSuccessBorder: "#a7f3d0",
        },
        Modal: {
            borderRadiusLG: 16,
        },
        FloatButton: {
            colorPrimary: "#10b981",
        },
    },
};

function App() {
    return (
        <ConfigProvider theme={antTheme}>
            <BrowserRouter>
                <MainRouter />
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
