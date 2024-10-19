import React, { useEffect, useState } from "react";
import api, { getAllFAQs } from "../../config/axios";
import './FAQ.css';
import { Alert } from "antd";

export default function FAQ(){
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="faq">
      <h2>Frequently Asked Questions</h2>
      {error && (
        <Alert className="alert">
          {error}
        </Alert>
      )}
      {loading ? (
        <p className="loading">Loading FAQs...</p>
      ) : (
        faqs.map(faq => (
          <div key={faq.faqId} className="faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))
      )}
    </div>
  );
};
