import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/Header/Header";
import FooterComponent from "../components/Footer/Footer";

const PublicShell = () => {
  return (
    <div className="min-h-screen flex flex-col grain-bg bg-paper">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterComponent />
    </div>
  );
};

export default PublicShell;
