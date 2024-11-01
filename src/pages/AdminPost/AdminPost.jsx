import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Radio, Upload, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { getAllPosts, createPost, updatePost, deletePost } from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import Box from "@mui/material/Box";
import './Blog.css'; 

const { Option } = Select;

const AdminPost = () => {
  const [posts, setPosts] = useState([]);// Stores list of posts
  const [loading, setLoading] = useState(false);// Indicates loading state
  const [error, setError] = useState(null);// Stores error messages
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState(false);// Controls CRUD modal visibility
  const [isEdit, setIsEdit] = useState(false);// Indicates if editing a post
  const [currentPost, setCurrentPost] = useState({});// Stores the post being edited
  const [currentAccountId, setCurrentAccountId] = useState(null);// Stores current account ID
  const [fileList, setFileList] = useState([]);// Stores list of files for upload
  const [filterStatus, setFilterStatus] = useState(null);// Stores filter status

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPosts();
        const filteredPosts = response.data.filter(post => post.id === 3 && (filterStatus === null || post.status === filterStatus));
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
  }, [filterStatus]);

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
    if (post.postId) {
      setCurrentPost(post);
    } else {
      setCurrentPost({ id: 3, name: '', description: '', status: 'inactive' });
    }
    setFileList([]);
    setIsEdit(!!post.postId);
    setIsCRUDModalOpen(true);
  };

  const handleCRUDOk = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (currentPost.name !== undefined) {
        formData.append('name', currentPost.name);
      }

      if (currentPost.description !== undefined) {
        formData.append('description', currentPost.description);
      }

      if (currentPost.status !== undefined) {
        formData.append('status', currentPost.status);
      }

      formData.append('accountId', currentAccountId);
      formData.append('id', currentPost.id);
      formData.append('elementId', 6);

      fileList.forEach((file) => {
        formData.append('images', file.originFileObj);
      });

      let response;
      if (isEdit) {
        response = await updatePost(currentPost.postId, formData);
      } else {
        response = await createPost(formData);
      }

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
      [name]: value
    });
  };

  return (
    <Box className="admin-post-container">
      <AppHeader />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <DashboardSidebar />
        <Box className="admin-post-main">
          <h2 className="admin-post-header">Manage Posts</h2>
          {error && <Alert message={error} type="error" showIcon />}
          <div className="admin-post-select">
            <Select
              placeholder="Select Status"
              style={{ width: 200 }}
              onChange={value => setFilterStatus(value)}
              allowClear
            >
              <Option value={null}>All</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
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
                  <div key={post.postId} className="admin-post-item">
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        {post.imageUrls.map((url, index) => (
                          <img key={index} src={url} alt={`Post ${post.postId}`} className="admin-post-image" />
                        ))}
                      </div>
                    )}
                    <div className="admin-post-divider"></div>
                    <div className="admin-post-content">
                      <div style={{ flex: 2 }}>
                        <h3 className="admin-post-name">Name: {post.name}</h3>
                        <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
                        <p className="admin-post-description">Description: {post.description}</p>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#ccc', margin: '0 10px' }}></div>
                      <div style={{ flex: 1 }}>
                        <p className="admin-post-status">Status: {post.status}</p>
                        <p className="admin-post-status">
                          Type: {post.id === 1 ? 'Koi' : post.id === 2 ? 'Decoration' : post.id === 3 ? 'Blog' : 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="admin-post-buttons">
                      <Button className="admin-post-button" onClick={() => showCRUDModal(post)}>Edit</Button>
                      <Button className="admin-post-button-danger" onClick={() => handleDelete(post.postId)}>
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
                  beforeUpload={() => false} 
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

