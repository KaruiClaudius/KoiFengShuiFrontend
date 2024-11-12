import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Upload, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { getAllPosts, createPost, updatePost, deletePost } from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import Box from "@mui/material/Box";
import './Blog.css'; 

const { Option } = Select;

const AdminPost = () => {
  const [posts, setPosts] = useState([]); // Stores list of posts
  const [loading, setLoading] = useState(false); // Indicates loading state
  const [error, setError] = useState(null); // Stores error messages
  const [currentPost, setCurrentPost] = useState({}); // Stores the post being edited
  const [currentAccountId, setCurrentAccountId] = useState(null); // Stores current account ID
  const [fileList, setFileList] = useState([]); // Stores list of files for upload
  const [filterStatus, setFilterStatus] = useState(null); // Stores filter status
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;
  const [showError, setShowError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [isEdit, setIsEdit] = useState(false); // Indicates if editing a post

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

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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

  const showModal = (post = {}) => {
    setIsEdit(!!post.postId);
    setIsModalOpen(true);

    setCurrentPost({
      ...post,
      status: post.status || 'active',
    });
  };

  const handleModalOk = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', currentPost.name || '');
      formData.append('description', currentPost.description || '');
      formData.append('status', currentPost.status || 'active');
      formData.append('accountId', currentAccountId);
      formData.append('id', 3);
      formData.append('elementId', 6);

      fileList.forEach((file) => {
        formData.append('images', file.originFileObj);
      });

      if (isEdit) {
        const response = await updatePost(currentPost.postId, formData);
        setPosts(prevPosts => prevPosts.map(post => post.postId === currentPost.postId ? response.data : post));
      } else {
        const response = await createPost(formData);
        setPosts(prevPosts => [...prevPosts, response.data]);
      }
      setIsModalOpen(false); // Close modal
      setCurrentPost({}); // Reset current post
      setFileList([]); // Reset file list
    } catch (err) {
      setError("An error occurred while saving Post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Close modal
    setCurrentPost({}); // Reset current post
    setFileList([]); // Reset file list
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost({ ...currentPost, [name]: value }); // Update current post fields
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const filteredBlogs = posts.filter(post =>
    post.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Box className="admin-post-container">
      <AppHeader />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <DashboardSidebar className="dashboard-sidebar" />
        <Box className="admin-post-main">
          <h2 className="admin-post-header">Manage Posts</h2>
          {showError && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setShowError(false)}
            />
          )}

          <div className="admin-post-wrapper">
            <div className="search-filter-container">
              <Input
                placeholder="Search by name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="admin-post-select">
              <Select
                placeholder="Select Status"
                style={{ width: 200 }}
                onChange={value => setFilterStatus(value)}
                allowClear
              >
                <Option>All</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
            <Button
              type="primary"
              onClick={() => showModal()} // Show modal for adding a new post
              className="add-post-button"
            >
              Add Post
            </Button>
            <div className="admin-post-list">
              {currentBlogs.map((post) => (
                <div key={post.postId} className="admin-post-item">
                  <div className="admin-post-content">
                    <div className="admin-post-left">
                      <h3 className="admin-post-name">Name: {post.name}</h3>
                      <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
                      <p className="admin-post-description">Description: {post.description}</p>
                      <p className="admin-post-status">Status: {post.status}</p>
                    </div>
                    <div className="admin-post-right">
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <img src={post.imageUrls[0]} alt={`Post ${post.postId}`} className="admin-post-image" />
                      )}
                    </div>
                  </div>
                  <div className="admin-post-buttons">
                    <Button className="admin-post-button-danger" onClick={() => handleDelete(post.postId)}>
                      Delete
                    </Button>
                    <Button className="admin-post-button" onClick={() => showModal(post)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <Button key={index} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Button>
            ))}
          </div>
          <Modal
            title={isEdit ? "Edit Post" : "Add Post"}
            open={isModalOpen}
            onOk={handleModalOk}
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
              >
                <div>
                  <Button
                    style={{
                      backgroundColor: currentPost.status === "active" ? "green" : "gray",
                      color: "white",
                      marginRight: "10px",
                    }}
                    onClick={() => {
                      setCurrentPost({
                        ...currentPost,
                        status: "active",
                      });
                    }}
                    disabled={currentPost.status === "active"}
                  >
                    Active
                  </Button>
                  <Button
                    style={{
                      backgroundColor: currentPost.status === "inactive" ? "red" : "gray",
                      color: "white",
                    }}
                    onClick={() => {
                      setCurrentPost({
                        ...currentPost,
                        status: "inactive",
                      });
                    }}
                    disabled={currentPost.status === "inactive"}
                  >
                    Inactive
                  </Button>
                </div>
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

  