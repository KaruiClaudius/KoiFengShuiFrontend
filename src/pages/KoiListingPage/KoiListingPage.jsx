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
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
const { Header, Sider, Content } = Layout;
const { Title } = Typography;
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import Panel from "antd/es/splitter/Panel";
import TruncatedText from "../../utils/TruncatedText";

const KoiListingPage = () => {
  const priceRanges = [
    { label: "0 - 1,000,000đ", min: 0, max: 1000000 },
    { label: "1,000,000đ - 2,000,000đ", min: 1000000, max: 2000000 },
    { label: "2,000,000đ - 3,000,000đ", min: 2000000, max: 3000000 },
    { label: "3,000,000đ - 4,000,000đ", min: 3000000, max: 4000000 },
    { label: "Trên 4,000,000đ", min: 4000000, max: Infinity },
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

  const [sortOrder, setSortOrder] = useState(null); // 'asc' or 'desc' or null
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedElementUrl, setSelectedElementUrl] = useState(null);

  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Read selectedCategory from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    const elementFromUrl = params.get("element");

    if (categoryFromUrl) {
      setSelectedCategory(Number(categoryFromUrl));
      if (elementFromUrl) {
        setSelectedElementUrl(elementFromUrl);
        setSelectedElement(elementFromUrl);
      }
      setCurrentPage(1); // Reset to first page for new category
    }
  }, [location.search]);

  //Filter By Element
  const filterKoiByElement = (data) => {
    if (selectedElement.length === 0) return data;
    return data.filter((item) => selectedElement.includes(item.elementId));
  };

  // Update fetchData to use selectedCategory directly
  const fetchData = useCallback(async () => {
    try {
      const responseMarketCategory = await api
        .get("/api/MarketCategory/GetAll")
        .then((response) => response.data);
      setCategory(responseMarketCategory.data);
      // setLoading(true); // Set loading before fetching
      const responseElement = await api
        .get("/api/Element/GetAll")
        .then((response) => response.data);
      setElement(responseElement.data);

      if (selectedCategory) {
        // Only fetch if category is set
        const responseKoi = await getFengShuiKoiFishPost(
          selectedCategory,
          currentPage,
          pageSize
        );
        const filteredData = filterKoiByElement(
          filterKoiByColor(filterKoiByPrice(responseKoi.data))
        );
        setCardDataKoi(filteredData);
        setTotal(responseKoi.totalItems);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage, pageSize, filterKoiByElement]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to the first page for a new category
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", value);
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
  };

  const handleColorChange = (checkedValues) => {
    setSelectedColors(checkedValues);
  };
  const handleElementChange = (checkedValues) => {
    setSelectedElementUrl(checkedValues);
    setSelectedElement(checkedValues);
  };
  useEffect(() => {
    if (selectedCategory) {
      fetchData();
    }
  }, [selectedCategory, handleElementChange]);

  //Filter By Color
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

  //Filter By Price
  const filterKoiByPrice = (data) => {
    if (!selectedPriceRange) return data;
    return data.filter((item) => {
      const price = Number(item.price);
      return price >= selectedPriceRange.min && price < selectedPriceRange.max;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedColors([]);
    setSelectedElement([]);
    setSelectedElementUrl(null);
    setSortOrder(null);
    message.success("Đã xóa tất cả bộ lọc");
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

  // Add sorting function
  const sortKoiByPrice = (data) => {
    if (!sortOrder) return data;

    return [...data].sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);

      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  };

  const renderKoi = (data) => {
    // Apply all filters and sorting
    const filteredData = sortKoiByPrice(
      filterKoiByElement(filterKoiByColor(filterKoiByPrice(data)))
    );

    return filteredData.map((item) => (
      <div className="card-containers" key={item.listingId}>
        <div className="property-cards">
          <div className="property-card-headers">
            {item.tierName === "Tin Nổi Bật" && (
              <div className="featured-badge">
                <span>Nổi bật</span>
              </div>
            )}

            <Link
              to={`/Details/${item.listingId}`}
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
                  href={`/Details/${item.listingId}`}
                  className="property-title-links"
                >
                  {item.elementName != "Non element" && `[${item.elementName}]`}{" "}
                  <TruncatedText text={item.title} maxLength={18} />{" "}
                </a>
              </h1>
            </div>

            <div className="property-price-containers">
              <span className="property-price-texts">Giá tiền: </span>
              <span
                className="property-price-prices"
                style={{ color: "red", marginLeft: "4px", fontWeight: "bold" }}
              >
                {formatCurrency(item.price)} đ
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
            <div
              className="flex flex-wrap gap-2"
              style={{
                backgroundColor: "white",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <Row gutter={[16, 8]}>
                <Radio.Group
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categoryData.map((category) => (
                    <Radio
                      key={category.categoryid}
                      value={category.categoryid}
                    >
                      {category.categoryName}
                    </Radio>
                  ))}
                </Radio.Group>
              </Row>
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

            <Radio.Group
              value={
                selectedPriceRange ? JSON.stringify(selectedPriceRange) : ""
              }
              onChange={(e) =>
                setSelectedPriceRange(
                  e.target.value ? JSON.parse(e.target.value) : null
                )
              }
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "10px",
                backgroundColor: "white",
                marginBottom: "10px",
              }}
            >
              {priceRanges.map((range, index) => (
                <Radio key={index} value={JSON.stringify(range)}>
                  {range.label}
                </Radio>
              ))}
            </Radio.Group>
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
                value={selectedElementUrl}
                onChange={handleElementChange}
                // onChange={(e) => handleElementChange(e.target.value)}
              >
                <Row gutter={[16, 8]} style={{ margin: "" }}>
                  {elementData.map((element) => (
                    <Col span={8}>
                      <Checkbox
                        value={element.elementId}
                        key={element.elementId}
                      >
                        {element.elementName}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          </div>
          <Button
            type="primary"
            onClick={clearFilters}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Xóa tất cả bộ lọc
          </Button>
        </Sider>
        <Content className="p-8 bg-gray-50">
          <Breadcrumb>
            <Breadcrumb.Item>
              {" "}
              <Link to="/" style={{ textDecoration: "none", color: "#F9A825" }}>
                Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {selectedCategory &&
                categoryData.find(
                  (category) => category.categoryid === selectedCategory
                )?.categoryName}
            </Breadcrumb.Item>
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
              <div className="koi-grid">{renderKoi(cardDataKoi)}</div>
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
          pageSize={total}
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
