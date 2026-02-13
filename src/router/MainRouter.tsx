import HomePage from "@pages/HomePage";
import HomePageLayout from "@layout/HomePageLayout";

import { useRoutes } from "react-router-dom";
import LandingPage from "@pages/LandingPage";
import ChatPage from "@pages/ChatPage";

const MainRouter = () => {
    return useRoutes([
        {
            path: "/",
            element: <LandingPage />,
        },
        {
            path: "/chat",
            element: <ChatPage />,
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
