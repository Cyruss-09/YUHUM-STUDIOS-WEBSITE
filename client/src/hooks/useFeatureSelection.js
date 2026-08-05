import { useState } from "react";

export function useFeatureSelection(features) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleCardClick = (id) => {
    setSelectedFeature((prev) => (prev === id ? null : id));
  };

  const activeItem = features.find((item) => item.id === selectedFeature);

  return { selectedFeature, handleCardClick, activeItem };
}