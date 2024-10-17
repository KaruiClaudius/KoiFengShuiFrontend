import React, { useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";
import api from "../../config/axios";
export default function KoiDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [koiDetails, setkoiDetails] = useState(null);
  const [error, setError] = React.useState(null); // Handle errors
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responseKoi = await api.get(
          `api/MarketplaceListings/Details/${id}`
        ); // Adjust endpoint

        setkoiDetails(responseKoi.data); // Store the data
      } catch (error) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    // Fetch data from API when the component mounts
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!koiDetails) return <div>No property details found</div>;

  return (
    <div
      style={{
        minHeight: "150vh",
        height: "100vh",
        background: "#f6f4f3",
      }}
      className="detail-page-container"
    >
      <AppHeader />
      <div></div>
      <FooterComponent />
    </div>
  );
}
