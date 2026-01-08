import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        theme={{
            token: {
                fontFamily: "Kanit",
            },
        }}
    >
        <App />
    </ConfigProvider>
);
