import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import { getAllPosts } from "../../config/axios";
import './Blog.css';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]); // Stores list of blog posts
  const [loading, setLoading] = useState(true); // Indicates loading state
  const [error, setError] = useState(null); // Stores error messages
  const [selectedPost, setSelectedPost] = useState(null); // Stores the selected post for modal

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await getAllPosts();
        const filteredPosts = response.data.filter(post => post.id === 3 && post.status === "active"); // Filter posts by id and status
        setBlogPosts(filteredPosts);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  const openModal = (post) => { // Opens modal when a post is clicked
    setSelectedPost(post);
  };

  const closeModal = () => { // Closes modal
    setSelectedPost(null);
  };

  const renderBlogCards = (data) => {
    return data.map((item) => (
      <div key={item.postId} className="blog-card" onClick={() => openModal(item)}>
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <img src={item.imageUrls[0]} alt={`Image for ${item.name}`} className="blog-card-image" />
        ) : (
          <p>No image available</p>
        )}
        <div className="blog-card-content">
          <h1 className="blog-card-title">
            {item.name}
          </h1>
          <div className="blog-card-divider"></div>
          <p className="blog-card-description">
            {item.description}
          </p>  
        </div>
      </div>
    ));
  };

  if (loading) return <p>Loading...</p>; // Display loading message
  if (error) return <p>Error: {error}</p>; // Display error message

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f6f4f3" }}>
      <AppHeader />
      <div className="blog-container" style={{ flex: 1 }}>
        <div className="blog-header">
          <h2>Kinh Nghiệm Hay</h2>
        </div>
        <div className="blog-cards">
          {renderBlogCards(blogPosts)}
        </div>
      </div>
      <FooterComponent />
      <Modal
        visible={!!selectedPost}
        onCancel={closeModal}
        footer={null}
        title={null}
      >
        {selectedPost && (
          <div>
            {selectedPost.imageUrls && selectedPost.imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Post ${selectedPost.postId}`} className="modal-image" />
            ))}
            <h2 className="modal-title">{selectedPost.name}</h2>
            <div className="modal-divider"></div>
            <p className="modal-description">{selectedPost.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
