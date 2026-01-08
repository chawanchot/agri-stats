import MainRouter from "@router/MainRouter";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <MainRouter />
        </BrowserRouter>
    );
}

export default App;
