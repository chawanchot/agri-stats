import HomePage from "@pages/HomePage";
import MainPage from "@pages/MainPage";

import { useRoutes } from "react-router-dom";

const MainRouter = () => {
    return useRoutes([
        {
            path: "/",
            element: <MainPage />,
        },
        {
            path: "/home",
            element: <HomePage />,
        },
    ]);
};

export default MainRouter;
