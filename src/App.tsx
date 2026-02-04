import MainRouter from "@router/MainRouter";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";

const antTheme = {
    components: {
        Cascader: {
            optionSelectedBg: "#ecfdf5",
            controlItemBgHover: "#f0fdf4",
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
    return (
        <ConfigProvider theme={antTheme}>
            <BrowserRouter>
                <MainRouter />
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
