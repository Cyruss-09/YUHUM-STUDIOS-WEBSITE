import { useState, useRef } from "react";
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

  // useRef guard: unlike useState, a ref mutation is synchronous and visible
  // immediately — even inside the same event-loop tick. This means a rapid
  // double-click cannot sneak a second request through before the first
  // setLoading(true) re-render has had a chance to disable the button.
  const isSubmittingRef = useRef(false);

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

    // Synchronous guard — blocks any concurrent call before React re-renders
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

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
      isSubmittingRef.current = false;
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