import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal } from "antd";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import Box from "@mui/material/Box"; 

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState(false); 
  const [isEdit, setIsEdit] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({});
  const [currentAccountId, setCurrentAccountId] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllFAQs();
        setFaqs(response.data);
      } catch (err) {
        console.error("Error fetching FAQs", err);
        setError("An error occurred while fetching FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();

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

  const handleDelete = async (faqId) => {
    setLoading(true);
    try {
      await deleteFAQ(faqId);
      setFaqs(faqs.filter((faq) => faq.faqId !== faqId));
    } catch (err) {
      console.error("Error deleting FAQ", err);
      setError("An error occurred while deleting FAQ");
    } finally {
      setLoading(false);
    }
  };

  const showCRUDModal = (faq = {}) => {
    setCurrentFaq(faq);
    setIsEdit(!!faq.faqId);
    setIsCRUDModalOpen(true);
  };

  const handleCRUDOk = async () => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateFAQ(currentFaq.faqId, currentFaq);
        setFaqs(
          faqs.map((faq) => (faq.faqId === currentFaq.faqId ? currentFaq : faq))
        );
      } else {
        if (!currentAccountId) {
          throw new Error("User not logged in or account ID not available");
        }
        const newFaq = { ...currentFaq, accountId: currentAccountId };
        const response = await createFAQ(newFaq);
        setFaqs([...faqs, response.data]);
      }
      setIsCRUDModalOpen(false);
      setCurrentFaq({});
    } catch (err) {
      console.error("Error saving FAQ", err);
      setError("An error occurred while saving FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCRUDModalOpen(false);
    setCurrentFaq({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaq({ ...currentFaq, [name]: value });
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
          <h2 style={{ color: "white" }}>Manage FAQs</h2>
          {error && <Alert message={error} type="error" showIcon />}
          {loading ? (
            <p style={{ color: "white" }}>Loading FAQs...</p>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Button type="primary" onClick={() => showCRUDModal()}>
                Add FAQ
              </Button>
              <div style={{ margin: '20px 0' }}>
                {faqs.map((faq) => (
                  <div key={faq.faqId} className="faq-item" style={{ 
                    margin: '10px 0', 
                    backgroundColor: "#ffffff", 
                    padding: '10px', 
                    borderRadius: '5px',
                    textAlign: 'left',
                  }}>
                    <h3 style={{ color: "black" }}>Question: {faq.question}</h3>
                    <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
                    <p style={{ color: "black", wordWrap: "break-word", overflowWrap: "break-word" }}>
                      Answer: {faq.answer}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <Button style={{ color: "black" }} onClick={() => showCRUDModal(faq)}>Edit</Button>
                      <Button danger style={{ color: "red" }} onClick={() => handleDelete(faq.faqId)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Modal
            title={isEdit ? "Edit FAQ" : "Add FAQ"}
            open={isCRUDModalOpen}
            onOk={handleCRUDOk}
            onCancel={handleCancel}
          >
            <Form layout="vertical">
              <Form.Item label="Question">
                <Input
                  name="question"
                  value={currentFaq.question || ""}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Answer">
                <Input.TextArea
                  name="answer"
                  value={currentFaq.answer || ""}
                  onChange={handleChange}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Box>
      </Box>
      <FooterComponent />
    </Box>
  );
};

export default FAQManager;
