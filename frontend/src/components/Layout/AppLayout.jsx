import { useState, createContext, useContext } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

/* Shared context so Navbar hamburger can toggle the mobile sidebar */
export const SidebarContext = createContext({ mobileOpen: false, setMobileOpen: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>

        {/* Mobile backdrop — closes sidebar when tapped */}
        {mobileOpen && (
          <div
            className="mobile-overlay lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — hidden off-screen on mobile, visible on lg+ */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Navbar />
          {/* Responsive page padding via CSS custom property */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: "var(--page-py) var(--page-px)" }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
