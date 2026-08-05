import { useState } from "react";
import { submitReview } from "../services/reviewApi";

const initialFormData = {
  userEmail: "",
  overallRating: 0,
  equipmentEase: 0,
  roomPrivacy: 0,
  propsSelection: 0,
  favoriteBackdrop: "",
  comments: "",
  recommend: null,
};

export function useReviewForm() {
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (category, value) => {
    updateField(category, value);
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMessage("");
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await submitReview(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("Something went wrong on the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    submitted,
    hoveredRating,
    setHoveredRating,
    loading,
    errorMessage,
    formData,
    updateField,
    handleRatingChange,
    handleReset,
    handleSubmit,
  };
}