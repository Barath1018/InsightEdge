// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./components/Dashboard/Dashboard";
import Reports from "./components/Reports/Reports";
import Settings from "./components/Settings/Settings";
import Notifications from "./components/Notifications/Notifications";
import Help from "./components/Help/Help";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      reports: "Reports",
      analytics: "Analytics",
      notifications: "Notifications",
      help: "Help",
      settings: "Settings"
    };
    return titles[activeTab] || "Dashboard";
  };

  const getPageSubtitle = () => {
    const subtitles: Record<string, string> = {
      dashboard: "Overview of your business performance",
      reports: "Generate and manage business reports",
      analytics: "Deep dive into your business data",
      notifications: "Stay updated with important alerts",
      help: "Get support and learn more",
      settings: "Manage your preferences and account"
    };
    return subtitles[activeTab] || "Overview of your business performance";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "reports":
        return <Reports />;
      case "analytics":
        return <Dashboard />;
      case "notifications":
        return <Notifications />;
      case "help":
        return <Help />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex">
                <Sidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
                <div className="flex-1 md:ml-64">
                  <Header
                    title={getPageTitle()}
                    subtitle={getPageSubtitle()}
                    onMenuClick={() => setSidebarOpen(true)}
                  />
                  <main className="min-h-screen">{renderContent()}</main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
