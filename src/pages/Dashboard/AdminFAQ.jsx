import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal } from "antd";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from "../../config/axios";

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({});


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

  const showModal = (faq = {}) => {
    setCurrentFaq(faq);
    setIsEdit(!!faq.faqId);
    setIsModalOpen(true);
  };

 
  const handleOk = async () => {
    setLoading(true);
    try {
      if (isEdit) {
       
        await updateFAQ(currentFaq.faqId, currentFaq);
        setFaqs(
          faqs.map((faq) => (faq.faqId === currentFaq.faqId ? currentFaq : faq))
        );
      } else {
       
        const newFaq = { ...currentFaq, accountId: 1 };
        const response = await createFAQ(newFaq);
        setFaqs([...faqs, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving FAQ", err);
      setError("An error occurred while saving FAQ");
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentFaq({});
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaq({ ...currentFaq, [name]: value });
  };

  return (
    <div className="faq">
      <h2>Manage FAQs</h2>
      {error && <Alert className="alert">{error}</Alert>}
      {loading ? (
        <p className="loading">Loading FAQs...</p>
      ) : (
        <div>
          <Button type="primary" onClick={() => showModal()}>
            Add FAQ
          </Button>
          {faqs.map((faq) => (
            <div key={faq.faqId} className="faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
              <Button onClick={() => showModal(faq)}>Edit</Button>
              <Button danger onClick={() => handleDelete(faq.faqId)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
      <Modal
        title={isEdit ? "Edit FAQ" : "Add FAQ"}
        open={isModalOpen} 
        onOk={handleOk}
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
    </div>
  );
};

export default AdminFAQ;