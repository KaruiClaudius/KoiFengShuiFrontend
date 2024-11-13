import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import des from "../../assets/deconration.png";
import usericon from "../../assets/icons/userIcon.png";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { getAllPosts } from "../../config/axios";
// import { CardContent } from "@mui/material";
// import { Typography } from "antd";
import TruncatedText from "../../utils/TruncatedText";
import {
  getFengShuiKoiFishPost,
  getFengShuiKoiDecorationPost,
  getKoiElement,
} from "../../config/axios";
import FAQDisplay from "../FAQ/FAQDisplay";
export default function Homepage() {
  const navigate = useNavigate();
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [cardDataKoiElement, setCardDataKoiElement] = React.useState([]); // Store data
  const [cardDataDecoration, setCardDataDecoration] = React.useState([]); // Store data
  const [existElementData, setExistElementData] = React.useState([]); // Store data
  const [cardDataPost, setCardDataPost] = React.useState([]); // Store data
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [error, setError] = React.useState(null); // Handle errors
  const [currentIndex, setCurrentIndex] = useState(0); // Carousel index
  const [isModalVisible, setIsModalVisible] = useState(false); // Manages the modal's visibility state; starts as false (hidden)
  const [selectedPost, setSelectedPost] = useState(null); // Stores the currently selected post; initially set to null (no post selected)

  const scrollContainerRef1 = useRef(null); // Reference to the scrollable container
  const scrollContainerRef2 = useRef(null);
  const scrollContainerRef3 = useRef(null);
  const scrollContainerRef4 = useRef(null);
  const [elementName, setElementName] = useState("");
  const [elementId, setElementId] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const sellingFishClick = (categoryId) => {
    // navigate("/KoiListings", {
    //   state: { category: categoryId },
    // });
    navigate(`/KoiListings?category=${categoryId}`);
  };
  // const sellingFishClick = () => {
  //   navigate("/KoiListings");
  // };

  const fishProductClick = () => {
    navigate("/fishProduct");
  };

  const koiCompatible = () => {
    navigate("/KoiCompatible");
  };

  const blogClick = () => {
    navigate("/blog");
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responseKoi = await getFengShuiKoiFishPost(1); // Adjust endpoint
        const responseDecoration = await getFengShuiKoiDecorationPost(2);
        const responsePost = await getAllPosts();

        setCardDataKoi(responseKoi.data); // Store the data
        setCardDataDecoration(responseDecoration.data);
        setCardDataPost(responsePost.data);
        if (user != null) {
          if (user.elementId) {
            const responseKoiElement = await getKoiElement(
              user.elementId,
              1,
              10
            ); // Store the data
            setCardDataKoiElement(responseKoiElement.data);
          }
        } else {
          setCardDataKoiElement(null);
        }
      } catch (error) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    // Fetch data from API when the component mounts
    fetchData();
  }, []);

  // Add event listener

  function formatCurrency(value) {
    // Ensure value is a number
    const numValue = Number(value);

    if (isNaN(numValue)) {
      return "Invalid input";
    }

    if (numValue < 1e6) {
      // Less than a million
      return addThousandSeparators(numValue);
    } else if (numValue >= 1e9) {
      // Billions
      return formatLargeNumber(numValue, 1e9, "tỷ");
    } else {
      // Default case (shouldn't normally be reached)
      return addThousandSeparators(numValue);
    }
  }

  function formatLargeNumber(value, unitValue, unitName) {
    const wholePart = Math.floor(value / unitValue);
    const fractionalPart = Math.round((value % unitValue) / (unitValue / 10));

    let result = addThousandSeparators(wholePart) + " " + unitName;
    if (fractionalPart > 0) {
      result += " " + addThousandSeparators(fractionalPart);
    }
    return result;
  }

  function addThousandSeparators(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  // Function to scroll left by a specific amount
  const scrollLeft = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -300, // Adjust the scroll distance as needed
        behavior: "smooth", // Smooth scroll
      });
    }
  };

  // Function to scroll right by a specific amount
  const scrollRight = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 300, // Adjust the scroll distance as needed
        behavior: "smooth", // Smooth scroll
      });
    }
  };

  const scrollLeft1 = () => scrollLeft(scrollContainerRef1);
  const scrollRight1 = () => scrollRight(scrollContainerRef1);
  const scrollLeft2 = () => scrollLeft(scrollContainerRef2);
  const scrollRight2 = () => scrollRight(scrollContainerRef2);
  const scrollLeft3 = () => scrollLeft(scrollContainerRef3);
  const scrollRight3 = () => scrollRight(scrollContainerRef3);
  const scrollLeft4 = () => scrollLeft(scrollContainerRef4);
  const scrollRight4 = () => scrollRight(scrollContainerRef4);

  const renderKoi = (data) => {
    return data.map((item) => (
      <div className="card-container" key={item.listingId}>
        <div className="property-card">
          {item.tierName === "Tin Nổi Bật" && (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          )}

          <Link
            to={`/Details/${item.listingId}`}
            style={{ justifyContent: "center" }}
          >
            <img
              src={item.listingImages?.[0]?.image?.imageUrl}
              alt={item.title}
              className="property-koi-image"
            />
          </Link>

          <div className="property-content">
            <div className="property-title-wrapper">
              <h1 className="property-title">
                <a
                  href={`/Details/${item.listingId}`}
                  className="property-title-link"
                >
                  {item.elementName != "Non element" && `[${item.elementName}]`}{" "}
                  <TruncatedText text={item.title} maxLength={10} />{" "}
                </a>
              </h1>
            </div>

            <div className="property-price-container">
              <span className="property-price-text">Giá tiền: </span>
              <span
                className="property-price-price"
                style={{ color: "red", marginLeft: "4px" }}
              >
                {formatCurrency(item.price)} đ
              </span>
            </div>

            <div className="property-user-container">
              <img
                src={
                  item.accountName
                    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                        item.accountName
                      )}`
                    : usericon
                }
                alt="User Icon"
                className="property-user-icon"
              />
              <span className="property-user-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // Function to render the posts
  const renderCardsPost = (data) => {
    const activePosts = data.filter((post) => post.status === "active");

    return activePosts.map((item, index) => (
      <div
        className="card-container"
        key={`${item.id}-${index}`}
        onClick={() => showModal(item)}
      >
        <div className="property-card">
          <img src={item.imageUrls[0]} alt="Card" className="property-image" />
          <div className="property-content">
            <h1 className="property-title">
              <TruncatedText text={item.name} maxLength={20} />
            </h1>
            <span className="property-price-text-black">
              {item.description}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  const showModal = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) return <p>Loading...</p>; // Display loading message
  if (error) return <p>Error: {error}</p>;
  return (
    <div
      style={{
        minHeight: "150vh",
        background: "#f6f4f3",
      }}
      className="homepage-container"
    >
      <AppHeader />
      <div className="image-container">
        <img src={image} alt="Banner" className="half-page-image" />

        <div className="centered-text">
          <div className="title-banner">
            <h1 style={{ color: "#e20a15" }}>Koi</h1>
            <h1 style={{ color: "#ff914d" }}>FengShui</h1>
          </div>
          <p style={{ color: "white", fontWeight: "bold" }}>
            Cân Bằng Phong Thủy, Koi Vượng Tài Lộc
          </p>
          <div className="search-bar-container">
            <button className="search-icon-button">
              <img
                src={searchIcon}
                alt="Search"
                className="search-icon"
                style={{ width: "20px" }}
              />
            </button>
          </div>
          <div className="button-group">
            <button
              className="custom-button"
              onClick={() => sellingFishClick(1)}
            >
              Bán Cá Koi
            </button>
            <button
              className="custom-button"
              onClick={() => sellingFishClick(2)}
            >
              Phụ Kiện Hồ Cá
            </button>
            <button className="custom-button" onClick={blogClick}>
              Kinh Nghiệm Hay
            </button>
            <button className="custom-button" onClick={koiCompatible}>
              Tư Vấn Bản Mệnh
            </button>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="content-wrapper">
          {cardDataKoiElement != null ? (
            <div className="render-koi-elemet">
              <button onClick={scrollLeft1} className="arrow-button">
                ←
              </button>
              <div class="white-box">
                <div className="container-title">
                  <h2 className="container-title-title">
                    Cá Koi Theo Bản Mệnh
                  </h2>
                  <a
                    href={`/KoiListings?category=1&element=${user.elementId}`}
                    className="container-title-link"
                  >
                    <h2>Xem thêm {">"}</h2>
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    overflowX: "hidden",
                    width: "100%",
                  }}
                  ref={scrollContainerRef1}
                  className="scroll-container"
                >
                  {/* Render Koi items here */}
                  {renderKoi(cardDataKoiElement)}
                </div>
              </div>
              <button onClick={scrollRight1} className="arrow-button">
                →
              </button>
            </div>
          ) : null}

          <div
            className="render-koi-elemet"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button onClick={scrollLeft2} className="arrow-button">
              ←
            </button>
            <div class="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Bán Cá Koi</h2>
                <a
                  href={`/KoiListings?category=1`}
                  className="container-title-link"
                >
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>
              <div
                style={{ display: "flex", overflowX: "hidden" }}
                ref={scrollContainerRef2}
                className="scroll-container"
              >
                {renderKoi(cardDataKoi)}
              </div>
            </div>
            <button onClick={scrollRight2} className="arrow-button">
              →
            </button>
          </div>

          <div
            className="render-koi-elemet"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button onClick={scrollLeft3} className="arrow-button">
              ←
            </button>
            <div class="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Trang trí hồ cá</h2>
                <a
                  href={`/KoiListings?category=2`}
                  className="container-title-link"
                >
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>
              <div
                style={{ display: "flex", overflowX: "hidden" }}
                ref={scrollContainerRef3}
                className="scroll-container"
              >
                {renderKoi(cardDataDecoration)}
              </div>
            </div>
            <button onClick={scrollRight3} className="arrow-button">
              →
            </button>
          </div>

          <div
            className="render-koi-elemet"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button onClick={scrollLeft4} className="arrow-button">
              ←
            </button>
            <div className="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Kinh Nghiệm Hay</h2>
                <a href={`/blog`} className="container-title-link">
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>
              <div
                style={{ display: "flex", overflowX: "hidden" }}
                ref={scrollContainerRef4}
                className="scroll-container"
              >
                {renderCardsPost(cardDataPost)}
              </div>
            </div>
            <button onClick={scrollRight4} className="arrow-button">
              →
            </button>
          </div>
        </div>
      </div>

      <FAQDisplay />
      <FooterComponent />
      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <img
          src={selectedPost?.imageUrls[0]}
          alt="Card"
          style={{ width: "100%" }}
        />
        <h2 style={{ textAlign: "center", marginTop: "10px" }}>
          {selectedPost?.name}
        </h2>
        <p>{selectedPost?.description}</p>
      </Modal>
    </div>
  );
}
