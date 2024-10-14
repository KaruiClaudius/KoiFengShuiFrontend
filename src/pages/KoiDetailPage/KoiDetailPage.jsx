import React, { useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import "./KoiDetailPage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";

import api, { getFengShuiKoiFishPost } from "../../config/axios";
export default function KoiDetailPage() {
  return (
    <div
      style={{
        minHeight: "150vh",
        background: "#f6f4f3",
      }}
      className="homepage-container"
    >
      <AppHeader />

      <FooterComponent />
    </div>
  );
}
