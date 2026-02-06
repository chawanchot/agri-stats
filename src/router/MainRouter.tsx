import HomePage from "@pages/HomePage";
import HomePageLayout from "@layout/HomePageLayout";

import { useRoutes } from "react-router-dom";
import LandingPage from "@pages/LandingPage";

const MainRouter = () => {
    return useRoutes([
        {
            path: "/",
            element: <LandingPage />,
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
