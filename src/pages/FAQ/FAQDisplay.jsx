import React, { useEffect, useState } from "react";
import { getAllFAQs } from "../../config/axios";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQDisplay = () => {
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
    <Box sx={{ padding: 2, backgroundColor: "#f9f9f9" }}>
      <Typography variant="h4" gutterBottom>
        FAQ
      </Typography>
      {loading && <p>Loading FAQs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {faqs.map((faq) => (
        <Accordion key={faq.faqId}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQDisplay;
