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
  InputNumber,
  Checkbox,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { InboxOutlined } from "@ant-design/icons";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api, { postMarketplaceListings } from "../../config/axios";
import "../PostListing/PostListingPage.css";
import PostListingPreview from "./PostListingPreview";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const { Option } = Select;
const PostProperty = () => {
  const [form] = Form.useForm();
  const [fileLists, setFileList] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [elementData, setElement] = useState([]);
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

      const responseMarketCategory = await api
        .get("/api/MarketCategory/GetAll")
        .then((response) => response.data);

      setElement(responseElement.data);
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
  const succesNavigate = useCallback(() => {
    navigate("/");
  }, [navigate]);

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
          !values.colors ||
          !values.element
        ) {
          throw new Error("Missing required fields");
        }

        // Store form data before creating the listing
        localStorage.setItem("pendingPropertyData", JSON.stringify(values));
        await createListing();
      } catch (error) {
        console.error("Error details:", error);
        message.error(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [getUserIdFromLocalStorage, createListing]
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
      formData.append("TierId", 1);
      formData.append("Title", storedValues.tittle);
      formData.append("Description", storedValues.description);
      formData.append("Price", storedValues.price);
      formData.append("Color", storedValues.colors.join(", "));
      formData.append("Quantity", storedValues.quantity);
      formData.append("CategoryId", storedValues.category);
      formData.append("CreateAt", getCurrentDateTime());
      formData.append("ExpiresAt", getCurrentDateTime(30));
      formData.append("IsActive", true);
      formData.append("Status", "Approved");
      formData.append("ElementId", storedValues.element);

      // Handle file uploads
      if (fileLists && fileLists.length > 0) {
        fileLists.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      const response = await postMarketplaceListings(formData);

      if (response.status !== 1) {
        throw new Error(`API call failed with status ${response.status}`);
      }

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
  }, [fileLists, getUserIdFromLocalStorage, form, succesNavigate]);

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
      if (!values.colors || values.colors.length === 0)
        errors.push("Hãy chọn ít nhất 1 màu");
      if (!values.element) errors.push("Hãy chọn nguyên tố");
      if (!fileLists || fileLists.length === 0)
        errors.push("Đăng ít nhất 1 bức ảnh liên quan đến sản phẩm");
      if (fileLists.length > 5)
        errors.push("Chỉ được nhiều nhất 5 bức ảnh liên quan đến sản phẩm");
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

      await onFinish(values);
    } catch (error) {
      console.error("Tin đăng bị lỗi:", error);
      message.error("Hãy kiểm tra kĩ nội dung đăng tin");
    }
  }, [form, validateForm, onFinish]);

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
    </div>
  );
};

export default PostProperty;
