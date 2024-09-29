import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
const HomePage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #E0F7FA, #E1BEE7)",
      }}
    >
      <AppHeader />

      <FooterComponent />
    </div>
  );
};

export default HomePage;
