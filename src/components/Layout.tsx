import Header from "./Header";
import Footer from "./Footer";
import type { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
