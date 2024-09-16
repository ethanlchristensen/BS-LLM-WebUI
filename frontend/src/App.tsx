import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            document.getElementById("body")?.classList.add("theme", theme);
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="main-page font-work-sans h-screen max-h-[100dvh] overflow-auto flex flex-row">
                <Navbar />
                <Outlet />
            </div>
        </QueryClientProvider>
    )
}

export default App