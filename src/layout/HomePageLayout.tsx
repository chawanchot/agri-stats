import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const HomePageLayout = () => {
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default HomePageLayout;
