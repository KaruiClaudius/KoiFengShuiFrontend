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
  Card,
} from "antd";
import moment from "moment";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api from "../../config/axios";
import "./UserProfile.css";
import TopUpForm from "./TopUpForm"; // Make sure this path is correct

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const elementMapping = {
    1: "Mộc",
    2: "Hoả",
    3: "Thổ",
    4: "Kim",
    5: "Thuỷ",
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  const showTopUpModal = () => {
    setIsTopUpModalVisible(true);
  };

  const handleTopUpSuccess = (successMessage) => {
    message.success(successMessage);
    fetchUserData(); // Refresh user data to update wallet balance
    setIsTopUpModalVisible(false);
  };

  const handleTopUpCancel = () => {
    setIsTopUpModalVisible(false);
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      const elementName = user.elementId
        ? elementMapping[user.elementId]
        : "Không xác định";
      setUserData(user);
      setWalletBalance(user.wallet || 0); // Set the wallet balance
      form.setFieldsValue({
        ...user,
        dob: user.dob ? moment(user.dob) : null,
        elementName: elementName,
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
      setLoading(true);
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      const userResponse = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = userResponse.data.accountId;

      const dataToSend = {
        email: values.email,
        fullName: values.fullName,
        dob: values.dob.format("YYYY-MM-DD"),
        gender: values.gender,
        phone: values.phone,
      };

      const response = await api.put(`api/Account/${accountId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch updated user data
      await fetchUserData();

      // Dispatch custom event with updated user data
      const updatedUserData = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(updatedUserData.data));
      window.dispatchEvent(
        new CustomEvent("userProfileUpdated", { detail: updatedUserData.data })
      );

      message.success("Thông tin cá nhân đã được cập nhật thành công");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      message.error(
        `Lỗi cập nhật thông tin: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
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
          <>
            <Card className="wallet-card" style={{ marginBottom: 16 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h3>Số dư ví: {walletBalance.toLocaleString()} VND</h3>
                </Col>
                <Col>
                  <Button type="primary" onClick={showTopUpModal}>
                    Nạp tiền
                  </Button>
                </Col>
              </Row>
            </Card>
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
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
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
                  <Form.Item name="elementName" label="Mệnh">
                    <Input disabled style={{ color: "rgba(0, 0, 0, 0.85)" }} />
                  </Form.Item>
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
          </>
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
      <TopUpForm
        visible={isTopUpModalVisible}
        onSuccess={handleTopUpSuccess}
        onClose={handleTopUpCancel}
      />
      <FooterComponent />
    </Layout>
  );
};

export default UserProfile;
