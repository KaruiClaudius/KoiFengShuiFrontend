import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Radio } from "antd";
import { getAllAdminPosts, createPost, updatePost, deletePost } from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import Box from "@mui/material/Box";

const AdminPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [postType, setPostType] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPosts();
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching Posts", err);
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
        console.error("Error parsing user data", err);
        setError("An error occurred while getting user information");
      }
    }
  }, []);

  const handleDelete = async (postId) => {
    setLoading(true);
    try {
      await deletePost(postId);
      setPosts(posts.filter((post) => post.postId !== postId));
    } catch (err) {
      console.error("Error deleting Post", err);
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
      if (isEdit) {
        await updatePost(currentPost.postId, currentPost);
        setPosts(
          posts.map((post) => (post.postId === currentPost.postId ? currentPost : post))
        );
      } else {
        if (!currentAccountId) {
          throw new Error("User not logged in or account ID not available");
        }
        const newPost = {
          name: currentPost.name || "",
          description: currentPost.description || "",
          accountId: currentAccountId,
          elementId: currentPost.elementId || 1,
          status: currentPost.status || "inactive"
        };
        console.log("New post data:", newPost);
        const response = await createPost(newPost);
        setPosts([...posts, response.data]);
      }
      setIsCRUDModalOpen(false);
      setCurrentPost({});
    } catch (err) {
      console.error("Error saving Post", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
      }
      setError("An error occurred while saving Post: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCRUDModalOpen(false);
    setCurrentPost({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost({ ...currentPost, [name]: value });
  };

  const handleRadioChange = (name) => (e) => {
    setCurrentPost({ ...currentPost, [name]: e.target.value });
  };

  const handlePostTypeChange = (value) => {
    setPostType(value);
  };

  const filteredPosts = postType === 'all' 
    ? posts 
    : posts.filter(post => post.elementId === parseInt(postType));

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
          {loading ? (
            <p style={{ color: "white" }}>Loading Posts...</p>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Radio.Group 
                style={{ marginBottom: 20 }} 
                onChange={(e) => handlePostTypeChange(e.target.value)}
                value={postType}
              >
                <Radio.Button value="all">All Posts</Radio.Button>
                <Radio.Button value="1">Koi</Radio.Button>
                <Radio.Button value="2">Decoration</Radio.Button>
              </Radio.Group>
              <Button type="primary" onClick={() => showCRUDModal()} style={{ marginLeft: 10 }}>
                Add Post
              </Button>
              <div style={{ margin: '20px 0' }}>
                {filteredPosts.map((post) => (
                  <div key={post.postId} className="post-item" style={{ 
                    margin: '10px 0', 
                    backgroundColor: "#ffffff", 
                    padding: '10px', 
                    borderRadius: '5px',
                    textAlign: 'left',
                  }}>
                    <h3 style={{ color: "black" }}>Title: {post.name}</h3>
                    <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
                    <p style={{ color: "black", wordWrap: "break-word", overflowWrap: "break-word" }}>
                      Description: {post.description}
                    </p>
                    <p style={{ color: "black" }}>Status: {post.status}</p>
                    <p style={{ color: "black" }}>Type: {post.elementId === 1 ? 'Koi' : 'Decoration'}</p>
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
                label="Status"
                name="status"
              >
                <Radio.Group
                  name="status"
                  value={currentPost.status}
                  onChange={handleRadioChange('status')}
                >
                  <Radio value="active">Active</Radio>
                  <Radio value="inactive">Inactive</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item 
                label="Category"
                name="elementId"
              >
                <Radio.Group
                  name="elementId"
                  value={currentPost.elementId}
                  onChange={handleRadioChange('elementId')}
                >
                  <Radio value={1}>Koi</Radio>
                  <Radio value={2}>Decoration</Radio>
                </Radio.Group>
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
