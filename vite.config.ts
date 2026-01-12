import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@pages": path.resolve(__dirname, "src/pages"),
            "@components": path.resolve(__dirname, "src/components"),
            "@assets": path.resolve(__dirname, "src/assets"),
            "@data": path.resolve(__dirname, "src/data"),
            "@router": path.resolve(__dirname, "src/router"),
            "@store": path.resolve(__dirname, "src/store"),
        },
    },
    server: {
        open: true,
        port: 3000,
    },
});
