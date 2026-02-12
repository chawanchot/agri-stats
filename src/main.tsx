import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { store } from "@store/store.ts";
import { HashRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        theme={{
            token: {
                fontFamily: "Noto Sans Thai",
            },
        }}
    >
        <Provider store={store}>
            <HashRouter>
                <App />
            </HashRouter>
        </Provider>
    </ConfigProvider>
);
