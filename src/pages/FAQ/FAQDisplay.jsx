import React, { useEffect, useState } from "react";
import { getAllFAQs } from "../../config/axios";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQDisplay = () => {
  const [faqs, setFaqs] = useState([]); // Stores list of FAQ
  const [loading, setLoading] = useState(false); // Indicates loading state
  const [error, setError] = useState(null); // Stores error messages

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllFAQs();
        setFaqs(response.data); // Store fetched FAQ
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
    <Box sx={{ padding: 0.5, backgroundColor: "#f9f9f9", maxHeight: '250px', overflowY: 'auto' }}>
      {loading && <p>Loading FAQs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {faqs.map((faq) => (
        <Accordion key={faq.faqId} sx={{ marginBottom: 0.3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQDisplay;
