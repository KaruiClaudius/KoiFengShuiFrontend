import React, { useState, useEffect } from "react";
import api from "../../config/axios";
import { Alert } from "@mui/joy";

export default function FAQ() {
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
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <p>Loading FAQs...</p>
      ) : (
        faqs.map(faq => (
          <div key={faq.FAQId} className="faq-item">
            <h3>{faq.Question}</h3>
            <p>{faq.Answer}</p>
          </div>
        ))
      )}
    </div>
  );
}
