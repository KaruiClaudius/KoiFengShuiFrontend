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
import { Link, useNavigate } from "react-router-dom";
import { InboxOutlined } from "@ant-design/icons";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api, { postMarketplaceListings } from "../../config/axios";
import TopUpForm from "../UserProfile/TopUpForm"; // Make sure this path is correct
import { Await } from "react-router-dom";
import "../PostListing/PostListingPage.css";
import PostListingPreview from "./PostListingPreview";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const { Option } = Select;
const { Panel } = Collapse;
const PostProperty = (initialAmount = 0) => {
  const [form] = Form.useForm();
  const [fileLists, setFileList] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [chosenTier, setChoosenTier] = useState(null);
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
  const [walletBalance, setWalletBalance] = useState(0);

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

      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;

      setWalletBalance(user.wallet || 0); // Set the wallet balance
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
  const navigate = useNavigate();
  const succesNavigate = () => {
    navigate("/");
  };

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
          !values.element ||
          !values.duration
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
    [getUserIdFromLocalStorage, handleUploadChange]
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
            // console.log(`Image ${index + 1}:`, file.originFileObj); // Log each image
          }
        });
      }

      const response = await postMarketplaceListings(formData);

      if (response.status !== 1) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      await updateUserWallet(accountId, price);
      message.success("Đăng tin thành công!");
      form.resetFields();
      setFileList([]);
      localStorage.removeItem("pendingPropertyData");
      // Redirect the user to a different page
      succesNavigate();
    } catch (error) {
      console.error("Lỗi Đăng Tin:", error);
      message.error("Đăng tin thất bại. Xin hãy thử lại!");
    } finally {
      setIsLoading(false);
    }
  }, [
    fileLists,
    duration,
    getUserIdFromLocalStorage,
    form,
    handleUploadChange,
  ]);

  const validateForm = useCallback(
    async (values) => {
      const errors = [];

      if (!values.category) errors.push("Cần chọn danh mục tin đăng");
      if (!values.tittle) errors.push("Hãy nhập tiêu đề tin đăng");
      if (
        !values.description ||
        values.description.trim() === "" ||
        values.description.trim() === "<p><br></p>"
      )
        errors.push("Hãy nhập mô tả tin đăng");
      if (!values.price) errors.push("Hãy thêm giá");
      if (!values.quantity) errors.push("Hãy thêm số lượng");
      if (!values.tier) errors.push("Hãy chọn loại tin đăng");
      if (!values.colors || values.colors.length === 0)
        errors.push("Hãy chọn ít nhất 1 màu");
      if (!values.element) errors.push("Hãy chọn nguyên tố");
      if (!fileLists || fileLists.length === 0)
        errors.push("Đăng ít nhất 1 bức ảnh liên quan đến sản phẩm");
      if (fileLists.length > 5)
        errors.push("Chỉ được nhiều nhất 5 bức ảnh liên quan đến sản phẩm");
      if (!values.duration) errors.push("Hãy nhập số ngày duy trì đăng tin");
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

      // setIsLoading(true);
      // await onFinish(values);
      setIsMembershipModalVisible(true);
    } catch (error) {
      console.error("Tin đăng bị lỗi:", error);
      message.error("Hãy kiểm tra kĩ nội dung đăng tin");
    }
  }, [form, validateForm, onFinish, handleUploadChange]);

  const handleMembershipChoice = async (choice) => {
    setIsMembershipModalVisible(false);
    if (price <= walletBalance) {
      const values = await form.validateFields();
      await onFinish(values);
    } else {
      setIsTopUpModalVisible(true);
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
    const basePrice = calculatePostingFee(day);

    // Add premium fee if tier 2 is selected
    if (chosenTier && form.getFieldValue("tier") === 2) {
      setPrice(basePrice + 30000);
    } else {
      setPrice(basePrice);
    }
  };

  const handleTierChange = (value) => {
    const selectedTierObject = tierData.find((tier) => tier.tierId === value);
    setChoosenTier(selectedTierObject?.tierName);
    // Recalculate price when tier changes
    const currentDuration = form.getFieldValue("duration");
    if (currentDuration) {
      const basePrice = calculatePostingFee(currentDuration);
      if (value === 2) {
        setPrice(basePrice + 30000);
      } else {
        setPrice(basePrice);
      }
    }
  };

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

  const updateUserWallet = async (accountId, amount) => {
    try {
      const updateWalletResponse = await api.post(
        `api/Account/UpdateWalletAfterPosted?accountId=${accountId}&amount=${amount}`
      );
      if (updateWalletResponse.status === 200) {
        //message.success("Wallet updated successfully");
        // Update the local storage with the new wallet balance
        setWalletBalance(walletBalance - price);
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
    const formattedDate = ` ${year}/${month < 10 ? "0" : ""}${month}/${
      day < 10 ? "0" : ""
    }${day}`;
    const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return `${formattedDate} ${formattedTime}`;
  }

  if (isLoading) return <p>Loading...</p>; // Display loading message

  const fontSizeArr = [
    "8px",
    "9px",
    "10px",
    "12px",
    "14px",
    "16px",
    "20px",
    "24px",
    "32px",
    "42px",
    "54px",
    "68px",
    "84px",
    "98px",
  ];

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote"],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ direction: "rtl" }], // text direction

      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ["clean"], // remove formatting button
    ],
  };
  const showTopUpModal = () => {
    setIsTopUpModalVisible(true);
  };
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
                  style={{ marginBottom: "0" }}
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
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "0.9em",
                    marginBottom: "24px",
                  }}
                >
                  1 ngày đăng tin là 5,000đ
                </span>
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
                  <Select
                    placeholder="Chọn một loại tin đăng"
                    onSelect={handleTierChange}
                  >
                    {tierData.map((tier) => (
                      <Option
                        key={tier.tierId}
                        value={tier.tierId}
                        title={tier.tierName}
                      >
                        {tier.tierName}
                      </Option>
                    ))}
                    {/* <Option value="normal">Tin thường</Option>
                    <Option value="preminum">Tin đăng nổi bật</Option> */}
                  </Select>
                </Form.Item>
                <Form.Item required>
                  {duration !== null && (
                    <span>
                      Giá{" "}
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        {chosenTier}
                      </span>{" "}
                      đăng trong{" "}
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        {duration}
                      </span>{" "}
                      ngày là:{" "}
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        {formatCurrency(price)} đ
                      </span>
                      {form.getFieldValue("tier") === 2 && (
                        <span
                          style={{
                            color: "green",
                            marginLeft: "8px",
                            fontSize: "0.9em",
                          }}
                        >
                          (Bao gồm phí tin nổi bật: 30,000đ)
                        </span>
                      )}
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
                      Tiêu đề tin đăng
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
                </Form.Item>
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Mô tả chi tiết
                    </span>
                  }
                  required
                  style={{ marginBottom: "0" }}
                >
                  <div style={{ backgroundColor: "white" }}>
                    <Form.Item name="description">
                      <ReactQuill
                        placeholder="Mô tả chi tiết"
                        theme="snow"
                        modules={modules}
                      />
                    </Form.Item>
                  </div>
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
                      style={{ width: "100%" }}
                      placeholder="Giá"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      min={0}
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
        width={600} // Increased width for better layout
      >
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    <span style={{ fontSize: "24px" }}>
                      {" "}
                      {formatCurrency(walletBalance)} VND
                    </span>
                  </p>
                </div>
                <Button
                  onClick={showTopUpModal}
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

          {walletBalance < price && (
            <div>
              <p>
                Số tiền cần nạp: {formatCurrency(price - walletBalance)}
                VNĐ
              </p>
            </div>
          )}

          {walletBalance >= price ? (
            <Button
              type="primary"
              onClick={() => handleMembershipChoice()}
              style={{ marginTop: 20 }}
            >
              Trả bằng ví
            </Button>
          ) : (
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
          )}
        </div>
      </Modal>

      <TopUpForm
        visible={isTopUpModalVisible}
        onSuccess={handleTopUpSuccess}
        onClose={handleTopUpCancel}
        // onReturnToMembership={handleTopUpCancel}
      />
    </div>
  );
};

export default PostProperty;
