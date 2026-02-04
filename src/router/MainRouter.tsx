import HomePage from "@pages/HomePage";
import MainPage from "@pages/MainPage";
import HomePageLayout from "@layout/HomePageLayout";

import { useRoutes } from "react-router-dom";
import LandingPage from "@pages/LandingPage";

const MainRouter = () => {
    return useRoutes([
        {
            path: "/",
            element: <MainPage />,
        },
        {
            path: "landing",
            element: <LandingPage />
        },
        {
            element: <HomePageLayout />,
            children: [
                {
                    path: "/home",
                    element: <HomePage />,
                },
            ],
        },
    ]);
};

export default MainRouter;
