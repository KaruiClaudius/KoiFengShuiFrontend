// import AppHeader from "../../components/Header/Header";
// import FooterComponent from "../../components/Footer/Footer";
// import { Layout } from "antd";
// import { Content } from "antd/es/layout/layout";

// export default function KoiListingPage() {
//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <AppHeader />
//       <Content></Content>
//       <FooterComponent />
//     </Layout>
//   );
// }
import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Col,
  Row,
  Radio,
  Breadcrumb,
  message,
  Modal,
  InputNumber,
  Checkbox,
  Card,
  DatePicker,
  Layout,
  Typography,
  List,
  Tag,
  Pagination,
  Collapse,
  Space,
} from "antd";
import {
  FilterOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import api, { getFengShuiKoiFishPost } from "../../config/axios";
import "./KoiListingPage.css";
import { Link, useNavigate } from "react-router-dom";
const { Header, Sider, Content } = Layout;
const { Title } = Typography;
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import Panel from "antd/es/splitter/Panel";
const KoiListingPage = () => {
  const priceRanges = [
    "0 - 1,000,000đ",
    "1,000,000đ - 2,000,000đ",
    "2,000,000đ - 3,000,000đ",
    "3,000,000đ - 4,000,000đ",
    "Over 4,000,000đ",
  ];

  const colors = [
    "White",
    "Red",
    "Black",
    "Yellow",
    "Orange",
    "Blue",
    "Gray",
    "Silver",
    "Purple",
    "Green",
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [elementData, setElement] = useState([]);
  const [categoryData, setCategory] = useState([]);
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data

  const [priceRange, setPriceRange] = useState(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [selectedColors, setSelectedColors] = useState([]); // New state for selected colors
  const [selectedElement, setSelectedElement] = useState([]); // New state for selected colors

  const handlePriceFilter = (min, max) => {
    setPriceRange({ min, max });
  };
  const clearFilters = () => {
    setPriceRange(null);
    setSelectedColors([]); // Clear selected colors
    message.success("Đã xóa tất cả bộ lọc");
  };

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const fetchData = useCallback(async () => {
    try {
      const responseElement = await api
        .get("/api/Element/GetAll")
        .then((response) => response.data);
      setElement(responseElement.data);

      const responseKoi = await getFengShuiKoiFishPost(currentPage, pageSize);
      setCardDataKoi(responseKoi.data);
      setTotal(responseKoi.data.length);
      const responseMarketCategory = await api
        .get("/api/MarketCategory/GetAll")
        .then((response) => response.data);
      setCategory(responseMarketCategory.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleColorChange = (checkedValues) => {
    setSelectedColors(checkedValues);
  };
  const handleElementChange = (checkedValues) => {
    setSelectedElement(checkedValues);
  };
  const filterKoiByColor = (data) => {
    if (selectedColors.length === 0) return data;
    return data.filter((item) => {
      // Check if item.color is defined and is a string
      if (item.color && typeof item.color === "string") {
        return selectedColors.some((color) =>
          item.color.toLowerCase().includes(color.toLowerCase())
        );
      }
      return false; // If item.color is undefined or not a string, exclude it
    });
  };
  const filterKoiByElement = (data) => {
    if (selectedElement.length === 0) return data;
    return data.filter((item) => {
      return selectedElement.includes(item.elementId);
    });
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) return <div>Error: {error}</div>;

  function formatCurrency(value) {
    // Ensure value is a number
    const numValue = Number(value);

    if (isNaN(numValue)) {
      return "Invalid input";
    }

    if (numValue < 1e6) {
      // Less than a million
      return numValue.toLocaleString("vi-VN");
    } else if (numValue >= 1e6 && numValue < 1e9) {
      // Millions
      return formatLargeNumber(numValue, 1e6, "triệu");
    } else if (numValue >= 1e9) {
      // Billions
      return formatLargeNumber(numValue, 1e9, "tỷ");
    } else {
      // Default case (shouldn't normally be reached)
      return numValue.toLocaleString("vi-VN");
    }
  }

  function formatLargeNumber(value, unitValue, unitName) {
    const wholePart = Math.floor(value / unitValue);
    const fractionalPart = Math.round((value % unitValue) / (unitValue / 10));

    let result = wholePart.toLocaleString("vi-VN") + " " + unitName;
    if (fractionalPart > 0) {
      result += " " + fractionalPart.toLocaleString("vi-VN");
    }
    return result;
  }

  const renderKoi = (data) => {
    return data.map((item) => (
      <div className="card-containers" key={item.listingId}>
        <div className="property-cards">
          <div className="property-card-headers">
            {item.tierName === "Preminum" && (
              <div className="featured-badges">
                <span>Nổi bật</span>
              </div>
            )}

            <Link
              to={`/KoiDetails/${item.listingId}`}
              className="property-koi-image-links"
            >
              <img
                src={item.listingImages?.[0]?.image?.imageUrl}
                alt={item.title}
                className="property-koi-images"
              />
            </Link>
          </div>
          <div className="property-contents flex-1">
            <div className="property-title-wrappers">
              <h1 className="property-titles">
                <a
                  href={`/KoiDetails/${item.listingId}`}
                  className="property-title-links"
                >
                  [{item.elementName}] {item.title}{" "}
                </a>
              </h1>
            </div>

            <div className="property-price-containers">
              <span className="property-price-texts">Giá tiền: </span>
              <span
                className="property-price-prices"
                style={{ color: "red", marginLeft: "4px", fontWeight: "bold" }}
              >
                {formatCurrency(item.price)}VNĐ
              </span>
            </div>

            <div className="property-user-containers">
              <img
                src={
                  item.accountName
                    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                        item.accountName
                      )}`
                    : usericon
                }
                alt="User Icon"
                className="property-user-icons"
              />
              <span
                className="property-user-texts"
                style={{ margin: "auto", width: "100%" }}
              >
                {item.accountName}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };
  return (
    <Layout className="min-h-screen">
      <AppHeader />
      <Layout style={{ marginTop: "100px", padding: "0 20px" }}>
        <Sider
          width={250}
          className="sider"
          style={{ backgroundColor: "#f6f4f3", marginRight: "20px" }}
        >
          <div className="mt-4 mb-6">
            <Title
              level={4}
              style={{
                marginBottom: "10px",
                backgroundColor: "#d8d8d8",
                padding: "10px",
              }}
            >
              Danh mục sản phẩm
            </Title>
            <div className="flex flex-wrap gap-2">
              <Checkbox.Group
                style={{
                  marginBottom: "10px",
                  backgroundColor: "white",
                  padding: "10px",
                  width: "100%",
                }}
                // onChange={handleElementChange}
              >
                <Row gutter={[16, 8]} style={{ margin: "" }}>
                  <Radio.Group placeholder="Chọn một loại tin đăng">
                    {categoryData.map((category) => (
                      <Radio value={category.categoryid}>
                        {category.categoryName}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Row>
              </Checkbox.Group>
            </div>
          </div>
          <div className="mb-8">
            <Title
              level={4}
              style={{
                marginBottom: "10px",
                backgroundColor: "#d8d8d8",
                padding: "10px",
              }}
            >
              Lọc giá
            </Title>

            <List
              style={{
                marginBottom: "10px",
                backgroundColor: "white",
                paddingLeft: "20px",
              }}
              dataSource={priceRanges}
              renderItem={(range) => (
                <List.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {range}
                </List.Item>
              )}
            />
          </div>

          <div className="mt-4 mb-6">
            <Title
              level={4}
              style={{
                marginBottom: "10px",
                backgroundColor: "#d8d8d8",
                padding: "10px",
              }}
            >
              Màu sắc
            </Title>
            <div className="flex flex-wrap gap-2">
              <Checkbox.Group
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  paddingLeft: "20px",
                  marginBottom: "20px",
                }}
                onChange={handleColorChange}
              >
                <Row gutter={[10, 9]} style={{ margin: "5px" }}>
                  <Col span={10}>
                    <Checkbox value="Trắng">Trắng</Checkbox>
                  </Col>
                  <Col span={10}>
                    <Checkbox value="Đỏ">Đỏ</Checkbox>
                  </Col>
                  <Col span={10}>
                    <Checkbox value="Đen">Đen</Checkbox>
                  </Col>
                  <Col span={10}>
                    <Checkbox value="Vàng">Vàng</Checkbox>
                  </Col>
                  <Col span={10}>
                    <Checkbox value="Xám bạc">Xám bạc</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </div>
          </div>

          <div className="mt-4 mb-6">
            <Title
              level={4}
              style={{
                marginBottom: "10px",
                backgroundColor: "#d8d8d8",
                padding: "10px",
              }}
            >
              Bản mệnh
            </Title>
            <div className="flex flex-wrap gap-2">
              <Checkbox.Group
                style={{
                  marginBottom: "10px",
                  backgroundColor: "white",
                  padding: "10px",
                }}
                onChange={handleElementChange}
              >
                <Row gutter={[16, 8]} style={{ margin: "" }}>
                  {elementData.map((element) => (
                    <Col span={8}>
                      <Checkbox value={element.elementId}>
                        {element.elementName}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          </div>
          {/* <div className="mt-4 mb-6">
            <Collapse defaultActiveKey={["1", "2", "3", "4"]}>
              <Panel header="Lọc theo khoảng giá" key="1">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {[
                    { text: "Dưới 2 triệu", range: [0, 2000000] },
                    { text: "2 - 3 triệu", range: [2000000, 3000000] },
                    { text: "3 - 5 triệu", range: [3000000, 5000000] },
                    { text: "5 - 7 triệu", range: [5000000, 7000000] },
                    { text: "7 - 10 triệu", range: [7000000, 10000000] },
                    { text: "Trên 10 triệu", range: [10000000, Infinity] },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      type={
                        priceRange?.min === item.range[0] ? "primary" : "text"
                      }
                      onClick={() => handlePriceFilter(...item.range)}
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <span style={{ marginLeft: "0" }}>{item.text}</span>
                    </Button>
                  ))}
                </Space>
              </Panel>
            </Collapse>
          </div> */}
        </Sider>
        {/* {cardDataKoi.map((koi, index) => (
              <Link to={`/KoiDetails/${koi.listingId}`}>
                <Card key={index} hoverable className="bg-white card-koi">
                  <div className="flex">
                    <div className="card-meta-container">
                      <Card.Meta
                        description={
                          <div className="h-48 bg-blue-100 flex items-center justify-center">
                            <img
                              src={koi.listingImages?.[0]?.image?.imageUrl}
                              alt="Koi fish"
                              className="koi-image"
                            />
                          </div>
                        }
                      />

                      <Card.Meta
                        title={koi.title}
                        description={
                          <div>
                            <div className="text-red-500 font-bold">
                              {koi.price}
                            </div>
                            <div>{koi.variety}</div>
                            <div className="text-gray-500">
                              Seller: {koi.seller}
                            </div>
                          </div>
                        }
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))} */}
        <Content className="p-8 bg-gray-50">
          <Breadcrumb>
            <Breadcrumb.Item>
              {" "}
              <Link to="/" style={{ textDecoration: "none", color: "#F9A825" }}>
                Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Cá Koi</Breadcrumb.Item>
          </Breadcrumb>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Error: {error}
            </div>
          ) : (
            <>
              <div className="koi-grid">
                {renderKoi(filterKoiByElement(filterKoiByColor(cardDataKoi)))}
              </div>
            </>
          )}
        </Content>
      </Layout>
      <div
        className="mt-8 flex justify-center"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          margin: "32px auto",
        }}
      >
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          defaultCurrent={1}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
          pageSizeOptions={[6, 12, 50]}
        />
      </div>
      <FooterComponent />
    </Layout>
  );
};

export default KoiListingPage;
