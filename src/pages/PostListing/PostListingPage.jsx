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
  Collapse,
  DatePicker,
} from "antd";
import { Link } from "react-router-dom";
import { InboxOutlined } from "@ant-design/icons";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api, { postMarketplaceListings } from "../../config/axios";
import TransactionPopup from "../Transaction/TransactionPopUp";
import { Await } from "react-router-dom";
import "../PostListing/PostListingPage.css";
import PostListingPreview from "./PostListingPreview";

const { Option } = Select;
const { Panel } = Collapse;
const PostProperty = () => {
  const [form] = Form.useForm();
  const [fileLists, setFileList] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [isMembershipModalVisible, setIsMembershipModalVisible] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [elementData, setElement] = useState([]);
  const [tierData, setTier] = useState([]);
  const [categoryData, setCategory] = useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Validate files
    const errors = [];
    newFileList.forEach((file) => {
      if (file.size > 5000000) {
        // 5MB limit
        errors.push(`${file.name} is too large. Max size is 5MB`);
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        errors.push(`${file.name} is not a supported file type`);
      }
    });

    setFileErrors(errors);
    setFileList(newFileList);
  };

  // Define all callbacks before using them
  const getUserIdFromLocalStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        const userData = JSON.parse(storedData);
        return userData.accountId;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving or parsing data:", error);
      return null;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const responseElement = await api
        .get("/api/Element/GetAll")
        .then((response) => response.data);

      const responseTier = await api
        .get("/api/SubcriptionTiers/GetAll")
        .then((response) => response.data);

      const responseMarketCategory = await api
        .get("/api/MarketCategory/GetAll")
        .then((response) => response.data);

      setElement(responseElement.data);
      setTier(responseTier.data);
      setCategory(responseMarketCategory.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePreview = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        const previewData = {
          name: values.tittle,
          listingId: "Preview",
          description: values.description,
          price: values.price,
          quantity: values.quantity,
          ownerName: "Current User",
          homeImages: fileLists.map((file) => ({
            image: {
              imageUrl:
                file.thumbUrl ||
                file.url ||
                URL.createObjectURL(file.originFileObj),
            },
          })),
          colors: values.colors,
          elementName:
            elementData.find((el) => el.elementId === values.element)
              ?.elementName || "",
        };
        setPreviewData(previewData);
        setShowPreview(true);
      })
      .catch(() => {
        message.error("Please fill in all required fields before preview");
      });
  }, [form, fileLists, elementData]);
  const onFinish = useCallback(
    async (values) => {
      try {
        setIsLoading(true);
        const userId = getUserIdFromLocalStorage();
        if (!userId) {
          message.error("User ID not found. Please log in.");
          return;
        }

        // Validate form data
        if (
          !values.category ||
          !values.tittle ||
          !values.description ||
          !values.price ||
          !values.quantity ||
          !values.tier ||
          !values.colors ||
          !values.element
        ) {
          throw new Error("Missing required fields");
        }

        // Initiate payment first

        // Store form data in localStorage before redirecting
        localStorage.setItem("pendingPropertyData", JSON.stringify(values));
        await createListing();
        // Redirect to the payment URL
        //window.location.href = paymentResponse.data.PaymentUrl;
      } catch (error) {
        console.error("Error details:", error);
        message.error(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [getUserIdFromLocalStorage]
  );
  const createListing = useCallback(async () => {
    try {
      const storedValues = JSON.parse(
        localStorage.getItem("pendingPropertyData")
      );
      if (!storedValues) {
        throw new Error("No pending listing data found.");
      }

      const formData = new FormData();
      const accountId = getUserIdFromLocalStorage();

      // Append basic form data
      formData.append("AccountId", accountId);
      formData.append("TierId", storedValues.tier);
      formData.append("Title", storedValues.tittle);
      formData.append("Description", storedValues.description);
      formData.append("Price", storedValues.price);
      formData.append("Color", storedValues.colors.join(", "));
      formData.append("Quantity", storedValues.quantity);
      formData.append("CategoryId", storedValues.category);
      formData.append("CreateAt", getCurrentDateTime());
      formData.append("ExpiresAt", getCurrentDateTime(duration));
      formData.append("IsActive", true);
      formData.append("Status", "Approved");
      formData.append("ElementId", storedValues.element);

      // Handle file uploads
      if (fileLists && fileLists.length > 0) {
        fileLists.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      const response = await postMarketplaceListings(formData);

      if (response.status !== 1) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      message.success("Posting created successfully!");
      form.resetFields();
      setFileList([]);
      localStorage.removeItem("pendingPropertyData");
    } catch (error) {
      console.error("Error creating listing:", error);
      message.error("Failed to create listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fileLists, duration, getUserIdFromLocalStorage, form]);

  const validateForm = useCallback(
    async (values) => {
      const errors = [];

      if (!values.category) errors.push("Category is required");
      if (!values.tittle) errors.push("Title is required");
      if (!values.description) errors.push("Description is required");
      if (!values.price) errors.push("Price is required");
      if (!values.quantity) errors.push("Quantity is required");
      if (!values.tier) errors.push("Tier is required");
      if (!values.colors || values.colors.length === 0)
        errors.push("Colors are required");
      if (!values.element) errors.push("Element is required");
      if (!fileLists || fileLists.length === 0)
        errors.push("At least one image is required");
      if (fileLists.length > 5) errors.push("Maximum 5 images allowed");
      if (fileErrors.length > 0) errors.push(...fileErrors);

      return errors;
    },
    [fileLists, fileErrors]
  );

  // Modified submit handler
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const validationErrors = await validateForm(values);

      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => message.error(error));
        return;
      }

      setIsLoading(true);
      await onFinish(values);
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please check all required fields");
    }
  }, [form, validateForm, onFinish]);

  const handleMembershipChoice = async (choice) => {
    setIsMembershipModalVisible(false);
    if (choice === "wallet") {
      if (price <= 100000) {
        await onFinish(form.getFieldsValue());
      } else {
        setIsTopUpModalVisible(true);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) return <div>Error: {error}</div>;

  if (showPreview && previewData) {
    return (
      <div>
        <AppHeader />
        <PostListingPreview propertyDetails={previewData} />
        <Button
          onClick={() => setShowPreview(false)}
          style={{ marginTop: "0", height: "200px", width: "100%" }}
        >
          Trở Lại Đăng Tin
        </Button>
        <FooterComponent />
      </div>
    );
  }

  const calculatePostingFee = (values) => {
    //const baseFee = 10000; // Base fee in VND
    const durationFee = (values || 0) * 5000; // 5000 VND per day
    return durationFee;
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    form.setFieldsValue({ address: getFullAddress() });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDurationChange = (value) => {
    const day = value;
    setDuration(day);
    setPrice(calculatePostingFee(day));
  };
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

  const handleTopUpCancel = () => {
    setIsTopUpModalVisible(false);
    setIsMembershipModalVisible(true);
  };

  const handleTopUpSuccess = (successMessage) => {
    setIsTopUpModalVisible(false);
    message.success(successMessage);
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const updateUserWallet = async (amount) => {
    try {
      const updateWalletResponse = await api.post(
        `api/User/UpdateWallet?userId=${getUserIdFromLocalStorage()}&amount=${amount}`
      );
      if (updateWalletResponse.status === 1) {
        //message.success("Wallet updated successfully");
        // Update the local storage with the new wallet balance
        const userData = JSON.parse(localStorage.getItem("user"));
        userData.wallet -= amount;
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error("Failed to update wallet");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      message.error("Failed to update wallet");
    }
  };

  function getCurrentDateTime(daysToAdd = 0) {
    const now = new Date();

    // Add the specified number of days
    now.setDate(now.getDate() + daysToAdd);

    // Get date components
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-based
    const year = now.getFullYear();

    // Get time components
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Format date and time as a string
    const formattedDate = `${day < 10 ? "0" : ""}${day}/${
      month < 10 ? "0" : ""
    }${month}/${year}`;
    const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return `${formattedDate} ${formattedTime}`;
  }

  if (isLoading) return <p>Loading...</p>; // Display loading message

  return (
    <div className="page-containers">
      <AppHeader />
      <div className="content-wrappers">
        <div className="form-container">
          <Breadcrumb style={{ marginBottom: "16px", paddingBottom: "15px" }}>
            <Breadcrumb.Item>
              {" "}
              <Link to="/" style={{ textDecoration: "none", color: "#F9A825" }}>
                Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Đăng tin</Breadcrumb.Item>
          </Breadcrumb>
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="image"
                  label="Đăng Hình Ảnh"
                  style={{ marginBottom: "24px" }}
                >
                  <Upload.Dragger
                    accept=".jpg,.jpeg,.png"
                    fileList={fileLists}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "2px dashed #fd9252",
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined
                        style={{ fontSize: "48px", color: "#fcb921" }}
                      />
                    </p>
                    <p
                      style={{
                        color: "#fd9252",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      Đăng từ 1-5 hình
                    </p>
                  </Upload.Dragger>
                </Form.Item>
                <Form.Item
                  name="duration"
                  required
                  rules={[{ required: true, type: Number }]}
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Ngày duy trì tin đăng
                    </span>
                  }
                  style={{ marginBottom: "24px" }}
                >
                  <InputNumber
                    placeholder="Nhập số ngày"
                    style={{ width: "100%" }}
                    onChange={handleDurationChange}
                    min={1}
                    addonAfter="ngày"
                    required
                  />
                </Form.Item>
                <Form.Item
                  name="tier"
                  required
                  rules={[{ required: true, type: Number }]}
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Loại Tin Đăng
                    </span>
                  }
                  style={{ marginBottom: "24px" }}
                >
                  <Select placeholder="Chọn một loại tin đăng">
                    {tierData.map((tier) => (
                      <Option value={tier.tierId}>{tier.tierName}</Option>
                    ))}
                    {/* <Option value="normal">Tin thường</Option>
                    <Option value="preminum">Tin đăng nổi bật</Option> */}
                  </Select>
                </Form.Item>
                <Form.Item required>
                  {duration !== null && (
                    <span>
                      Giá tin đăng trong {duration} ngày là:{" "}
                      {formatCurrency(price)} VND/Tháng
                    </span>
                  )}
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="category"
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Danh Mục Tin Đăng
                    </span>
                  }
                  required
                  style={{ marginBottom: "24px" }}
                >
                  <Select placeholder="Chọn một loại tin đăng">
                    {categoryData.map((category) => (
                      <Option value={category.categoryid}>
                        {category.categoryName}
                      </Option>
                    ))}
                    {/* <Option value="dotrangtri">Đồ trang trí</Option> */}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Tiêu đề tin đăng và Mô tả chi tiết
                    </span>
                  }
                  required
                  style={{ marginBottom: "0" }}
                >
                  <Form.Item
                    name="tittle"
                    rules={[
                      { required: true, message: "Vui lòng nhập tiêu đề" },
                    ]}
                  >
                    <Input placeholder="Tiêu đề tin đăng" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                  >
                    <Input.TextArea placeholder="Mô tả chi tiết" rows={4} />
                  </Form.Item>
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Thông tin khác
                    </span>
                  }
                  style={{ marginBottom: 0 }}
                  required
                >
                  <Form.Item
                    name="quantity"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng cá" },
                    ]}
                  >
                    <InputNumber
                      placeholder="Số lượng cá"
                      min={1}
                      style={{ width: "100%" }}
                      addonAfter="con"
                    />
                  </Form.Item>

                  <Form.Item
                    name="price"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Giá"
                      min={3000}
                      style={{ width: "100%" }}
                      addonAfter="VNĐ"
                    />
                  </Form.Item>
                </Form.Item>

                <Form.Item
                  name="colors"
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Màu sắc
                    </span>
                  }
                  style={{ marginBottom: "24px" }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ít nhất một màu cá",
                    },
                  ]}
                >
                  <Checkbox.Group
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                    }}
                  >
                    <Row gutter={[16, 8]} style={{ margin: "5px" }}>
                      <Col span={8}>
                        <Checkbox value="Trắng">Trắng</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="Đỏ">Đỏ</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="Đen">Đen</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="Vàng">Vàng</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="Xám bạc">Xám bạc</Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  name="element"
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Bản mệnh
                    </span>
                  }
                  style={{
                    marginBottom: "24px",
                    width: "100%",
                  }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn một bản mệnh",
                    },
                  ]}
                >
                  <Radio.Group
                    style={{
                      width: "100%",

                      backgroundColor: "white",
                    }}
                  >
                    <Row gutter={[16, 8]} style={{ margin: "10px" }}>
                      {elementData.map((element) => (
                        <Col span={8}>
                          <Radio value={element.elementId}>
                            {element.elementName}
                          </Radio>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    type="primary"
                    style={{
                      background: "#ffffff",
                      color: "#fcb921",
                      marginRight: "10px", // Add margin to separate buttons
                      width: "200px",
                    }}
                    onClick={handlePreview}
                  >
                    Xem Trước
                  </Button>
                  <Button
                    type="primary"
                    //htmlType="submit"
                    style={{
                      background:
                        "linear-gradient(90deg, #fcd25e,#fdb859, #fc9a53)",
                      border: "none",
                      width: "200px",
                    }}
                    onClick={handleSubmit}
                  >
                    Đăng Tin
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      <FooterComponent />
      {/* Modal appear when đăng tin */}
      <Modal
        visible={isMembershipModalVisible}
        onCancel={() => setIsMembershipModalVisible(false)}
        footer={null}
        width={800} // Increased width for better layout
      >
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ paddingLeft: 20 }}>
              <h3
                style={{
                  fontSize: "28px",
                  color: "#2c3e50",
                  marginBottom: "30px",
                  borderBottom: "2px solid #3498db",
                  paddingBottom: "10px",
                }}
              >
                Sử dụng ví
              </h3>
              <div style={{ marginTop: "40px" }}>
                <h3>Chi tiết tài khoản</h3>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                  }}
                  hoverable
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ color: "#f0f0f0", marginBottom: "10px" }}>
                        TỔNG TÀI KHOẢN
                      </h4>
                      <p
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          margin: 0,
                        }}
                      >
                        {/*formatCurrency() ||*/ 0}{" "}
                        <span style={{ fontSize: "24px" }}>VND</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsMembershipModalVisible(false);
                        setIsTopUpModalVisible(true);
                      }}
                      style={{
                        backgroundColor: "#4CAF50",
                        borderColor: "#4CAF50",
                        color: "white",
                        fontWeight: "bold",
                        height: "auto",
                        padding: "10px 20px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#45a049")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#4CAF50")
                      }
                    >
                      +Nạp thêm
                    </Button>
                  </div>
                </Card>
              </div>
              <p style={{ fontSize: "18px", color: "#34495e" }}>
                Tiền đăng bài:{" "}
                <span style={{ fontWeight: "bold", color: "#e74c3c" }}>
                  {formatCurrency(price)} VNĐ
                </span>
              </p>

              <div>
                <p>
                  Số tiền cần nạp:{" "}
                  {/* {formatCurrency(price - getUserWalletLocalStorage())} */}
                  VNĐ
                </p>
              </div>

              <Button
                type="primary"
                onClick={() => handleMembershipChoice("wallet")}
                style={{ marginTop: 20 }}
              >
                Trả bằng ví
              </Button>
              {/* ) : (
                <div>
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    Không đủ tiền để đăng bài
                  </p>
                  <Button
                    type="primary"
                    onClick={() => {
                      setIsMembershipModalVisible(false);
                      setIsTopUpModalVisible(true);
                    }}
                    style={{ marginTop: 20 }}
                  >
                    Nạp ví
                  </Button>
                </div>
              )} */}
            </div>
          </Col>
        </Row>
      </Modal>

      {/* <TransactionPopup
        visible={isTopUpModalVisible}
        onSuccess={handleTopUpSuccess}
        onClose={handleTopUpCancel}
        onReturnToMembership={handleTopUpCancel}
      /> */}
    </div>
  );
};

export default PostProperty;
