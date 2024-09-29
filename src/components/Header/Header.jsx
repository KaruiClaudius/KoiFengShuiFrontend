import React from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Input, Space } from "antd";
import {
  BellOutlined,
  MessageOutlined,
  FileOutlined,
  DownOutlined,
  SearchOutlined,
  MenuOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/Logo_SWP.svg";

const { Header } = Layout;
const { SubMenu } = Menu;

const userMenu = (
  <Menu>
    <Menu.Item key="1">Profile</Menu.Item>
    <Menu.Item key="2">Logout</Menu.Item>
  </Menu>
);

const categories = [
  { key: "renting", label: "Thuê nhà" },
  { key: "thirdparty", label: "Dịch vụ bên thứ ba" },
];

const AppHeader = () => {
  return (
    <Header
      className="header"
      style={{
        backgroundColor: "#F9A825",
        padding: "0 50px",
        width: "95%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="logo">
        <img src={Logo} alt="UNINEST" style={{ height: "64px" }} />
      </div>

      <Menu
        mode="horizontal"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <SubMenu
          key="categories"
          title={
            <span>
              <MenuOutlined />
              <span style={{ marginLeft: "8px" }}>Categories</span>
              <DownOutlined style={{ marginLeft: "8px" }} />
            </span>
          }
        >
          {categories.map((category) => (
            <Menu.Item key={category.key}>{category.label}</Menu.Item>
          ))}
        </SubMenu>
      </Menu>

      <Input size="large" prefix={<SearchOutlined />} style={{ width: 750 }} />

      <Space size="middle">
        <Button type="text" icon={<BellOutlined />} size="large" />
        <Button type="text" icon={<MessageOutlined />} size="large" />
        <Button type="text" icon={<FileOutlined />} size="large" />
      </Space>

      <Dropdown overlay={userMenu} placement="bottomRight" size="large">
        <Space style={{ cursor: "pointer" }}>
          <Avatar src="/path-to-avatar.jpg" />
          <span>Minh Quang</span>
          <DownOutlined />
        </Space>
      </Dropdown>

      <Button
        icon={<UploadOutlined />}
        type="primary"
        style={{ marginLeft: "16px" }}
        danger
        size="large"
      >
        Đăng tin
      </Button>
    </Header>
  );
};

export default AppHeader;
