import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Radio, Upload, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { getAllPosts, createPost, updatePost, deletePost } from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import Box from "@mui/material/Box";

const { Option } = Select;

const AdminPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterElement, setFilterElement] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPosts();
        const filteredPosts = response.data.filter(post => {
          return (
            (filterCategory === null || post.id === filterCategory) &&
            (filterElement === null || post.elementId === filterElement)
          );
        });
        setPosts(filteredPosts);
      } catch (err) {
        setError("An error occurred while fetching Posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCurrentAccountId(user.accountId);
      } catch (err) {
        setError("An error occurred while getting user information");
      }
    }
  }, [filterCategory, filterElement]);

  const handleDelete = async (postId) => {
    setLoading(true);
    try {
      await deletePost(postId);
      setPosts(posts.filter((post) => post.postId !== postId));
    } catch (err) {
      setError("An error occurred while deleting Post");
    } finally {
      setLoading(false);
    }
  };

  const showCRUDModal = (post = {}) => {
    setCurrentPost(post);
    setIsEdit(!!post.postId);
    setIsCRUDModalOpen(true);
  };

  const handleCRUDOk = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', currentPost.name || "");
      formData.append('description', currentPost.description || "");
      formData.append('accountId', currentAccountId);
      formData.append('id', currentPost.id);
      formData.append('elementId', currentPost.elementId);
      formData.append('status', currentPost.status || "inactive");

      fileList.forEach((file) => {
        formData.append('images', file.originFileObj);
      });

      const response = await createPost(formData);

      setPosts(prevPosts => isEdit 
        ? prevPosts.map(post => post.postId === currentPost.postId ? response.data : post)
        : [...prevPosts, response.data]
      );

      setIsCRUDModalOpen(false);
      setCurrentPost({});
      setFileList([]);
    } catch (err) {
      setError("An error occurred while saving Post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCRUDModalOpen(false);
    setCurrentPost({});
    setFileList([]);
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost({
      ...currentPost,
      [name]: name === 'id' || name === 'elementId' ? parseInt(value, 10) : value
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#1E3A5F" }}>
      <AppHeader />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <DashboardSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "500px",
            maxWidth: "800px",
            paddingTop: "70px",
          }}
        >
          <h2 style={{ color: "white" }}>Manage Posts</h2>
          {error && <Alert message={error} type="error" showIcon />}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Select
              placeholder="Select Category"
              style={{ width: 200, marginRight: 10 }}
              onChange={value => setFilterCategory(value)}
              allowClear
            >
              <Option value={null}>All</Option>
              <Option value={1}>Koi</Option>
              <Option value={2}>Decoration</Option>
            </Select>
            <Select
              placeholder="Select Element"
              style={{ width: 200 }}
              onChange={value => setFilterElement(value)}
              allowClear
            >
              <Option value={null}>All</Option>
              <Option value={1}>Mộc</Option>
              <Option value={2}>Hỏa</Option>
              <Option value={3}>Thổ</Option>
              <Option value={4}>Kim</Option>
              <Option value={5}>Thủy</Option>
            </Select>
          </div>
          {loading ? (
            <p style={{ color: "white" }}>Loading Posts...</p>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Button type="primary" onClick={() => showCRUDModal()} style={{ marginLeft: 10 }}>
                Add Post
              </Button>
              <div style={{ margin: '20px 0' }}>
                {posts.map((post) => (
                  <div key={post.postId} className="post-item" style={{ 
                    margin: '10px 0', 
                    backgroundColor: "#ffffff", 
                    padding: '10px', 
                    borderRadius: '5px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                      <div style={{ flex: 2 }}>
                        <h3 style={{ color: "black" }}>Name: {post.name}</h3>
                        <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
                        <p style={{ 
                          color: "black", 
                          wordBreak: "break-word", 
                          overflowWrap: "break-word", 
                          whiteSpace: "normal"
                        }}>
                          Description: {post.description}
                        </p>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#ccc', margin: '0 10px' }}></div> {/* Thanh dọc */}
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "black" }}>Status: {post.status}</p>
                        <p style={{ color: "black" }}>
                          Type: {post.id === 1 ? 'Koi' : post.id === 2 ? 'Decoration' : 'Uncategorized'}
                        </p>
                        <p style={{ color: "black" }}>
                          Element: {post.elementId === 1 ? 'Mộc' : post.elementId === 2 ? 'Hỏa' : post.elementId === 3 ? 'Thổ' : post.elementId === 4 ? 'Kim' : 'Thủy'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <Button style={{ color: "black" }} onClick={() => showCRUDModal(post)}>Edit</Button>
                      <Button danger style={{ color: "red" }} onClick={() => handleDelete(post.postId)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Modal
            title={isEdit ? "Edit Post" : "Add Post"}
            open={isCRUDModalOpen}
            onOk={handleCRUDOk}
            onCancel={handleCancel}
          >
            <Form layout="vertical">
              <Form.Item 
                label="Title" 
                name="name"
                rules={[{ required: true, message: 'Please input the title!' }]}
              >
                <Input
                  name="name"
                  value={currentPost.name || ""}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item 
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input the description!' }]}
              >
                <Input.TextArea
                  name="description"
                  value={currentPost.description || ""}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item 
                label="Category"
                name="id"
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Radio.Group
                  name="id"
                  value={currentPost.id || ""}
                  onChange={handleChange}
                >
                  <Radio value={1}>Koi</Radio>
                  <Radio value={2}>Decoration</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item 
                label="Element"
                name="elementId"
                rules={[{ required: true, message: 'Please select an element!' }]}
              >
                <Radio.Group
                  name="elementId"
                  value={currentPost.elementId || ""}
                  onChange={handleChange}
                >
                  <Radio value={1}>Mộc</Radio>
                  <Radio value={2}>Hỏa</Radio>
                  <Radio value={3}>Thổ</Radio>
                  <Radio value={4}>Kim</Radio>
                  <Radio value={5}>Thủy</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item 
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select the status!' }]}
              >
                <Radio.Group
                  name="status"
                  value={currentPost.status || ""}
                  onChange={handleChange}
                >
                  <Radio value="active">Active</Radio>
                  <Radio value="inactive">Inactive</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Images">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false} // Prevent auto upload
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Form>
          </Modal>
        </Box>
      </Box>
      <FooterComponent />
    </Box>
  );
};

export default AdminPost;
