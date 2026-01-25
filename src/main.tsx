import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { store } from "@store/store.ts";

createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        theme={{
            token: {
                fontFamily: "Kanit",
            },
        }}
    >
        <Provider store={store}>
            <App />
        </Provider>
    </ConfigProvider>,
);
