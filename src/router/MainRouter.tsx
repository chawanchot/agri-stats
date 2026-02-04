import HomePage from "@pages/HomePage";
import MainPage from "@pages/MainPage";
import Layout from "@components/Layout";

import { useRoutes } from "react-router-dom";

const MainRouter = () => {
    return useRoutes([
        {
            path: "/",
            element: <MainPage />,
        },
        {
            path: "/home",
            element: (
                <Layout>
                    <HomePage />
                </Layout>
            ),
        },
    ]);
};

export default MainRouter;
