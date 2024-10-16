import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Breadcrumb,
  Typography,
} from "antd";
import moment from "moment";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api from "../../config/axios";
import "./UserProfile.css";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      setUserData(user);
      form.setFieldsValue({
        ...user,
        dob: user.dob ? moment(user.dob) : null,
        elementName: user.elementName || "Not available", // Add this line
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Error fetching user data");
      setLoading(false);
    }
  };

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
    if (e.key === "1" && userData) {
      form.setFieldsValue({
        ...userData,
        dob: userData.dob ? moment(userData.dob) : null,
      });
    } else if (e.key === "2") {
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    }
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      // First, fetch the user data to get the accountId
      const userResponse = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = userResponse.data.accountId;

      const dataToSend = {
        email: values.email,
        fullName: values.fullName,
        dob: values.dob.format("YYYY-MM-DD"), // Format date as YYYY-MM-DD
        gender: values.gender,
        phone: values.phone,
      };

      // Log the data being sent for debugging
      console.log("Data being sent:", dataToSend);

      const response = await api.put(`api/Account/${accountId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Server response:", response.data);
      message.success("Profile updated successfully");
      fetchUserData(); // Refresh the user data after update
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      message.error(
        `Error updating profile: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const onPasswordChange = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      // First, fetch the user data to get the accountId
      const userResponse = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = userResponse.data.accountId;

      // Now use the accountId in the password change request
      await api.put(
        `api/Account/${accountId}/change-password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Password changed successfully");
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    } catch (error) {
      console.error(
        "Error changing password:",
        error.response?.data || error.message
      );
      message.error(
        `Error changing password: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Function to render content based on selected menu item
  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    switch (selectedMenuItem) {
      case "1":
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={
              userData
                ? {
                    ...userData,
                    dob: userData.dob ? moment(userData.dob) : null,
                  }
                : {}
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ",
                },
              ]}
            >
              <Input
                disabled
                className="custom-disabled-input"
                style={{ color: "rgba(0, 0, 0, 0.85)" }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính" },
                  ]}
                >
                  <Select>
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dob"
                  label="Ngày, tháng, năm sinh"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Typography.Text>
                  <strong>Mệnh:</strong>{" "}
                  {userData?.elementName || "Not available"}
                </Typography.Text>
              </Col>
            </Row>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="user-profile-form-button"
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        );
      case "2":
        return (
          <Form form={form} layout="vertical" onFinish={onPasswordChange}>
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="password-change-button"
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="user-profile-layout">
      <AppHeader />

      <Row justify="center" align="middle" className="user-profile-row">
        <Col
          xs={{ flex: "0 0 100%" }}
          sm={{ flex: "0 0 90%" }}
          md={{ flex: "0 0 80%" }}
          lg={{ flex: "0 0 70%" }}
          xl={{ flex: "0 0 60%" }}
          xxl={{ flex: "0 0 50%" }}
        >
          <Breadcrumb className="user-profile-breadcrumb">
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item>Tài khoản</Breadcrumb.Item>
            <Breadcrumb.Item>
              {selectedMenuItem === "1"
                ? "Thông tin cá nhân"
                : "Cài đặt tài khoản"}
            </Breadcrumb.Item>
          </Breadcrumb>
          <Header className="user-profile-header">
            <h2>Thông tin cá nhân</h2>
          </Header>
          <Layout>
            <Sider width={250} className="user-profile-sider">
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                selectedKeys={[selectedMenuItem]}
                onClick={handleMenuClick}
                className="user-profile-menu"
              >
                <Menu.Item key="1">Thông tin cá nhân</Menu.Item>
                <Menu.Item key="2">Cài đặt tài khoản</Menu.Item>
              </Menu>
            </Sider>
            <Layout>
              <Content className="user-profile-content">
                {renderContent()}
              </Content>
            </Layout>
          </Layout>
        </Col>
      </Row>
      <FooterComponent />
    </Layout>
  );
};

export default UserProfile;
