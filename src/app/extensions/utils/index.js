import React, { useState, useEffect } from "react";

// Custom Hook to dynamically set id
export const setRequiredFieldName = (fieldNameGenerator) => {
  const [requiredFieldName, setRequiredFieldName] = useState("");

  useEffect(() => {
    // Dynamically set the id using the provided generator function
    setRequiredFieldName(fieldNameGenerator());
  }, [requiredFieldName]);
  
  return requiredFieldName;

};

export const setFieldValidity = (fieldName, setValidity, isValid) => {
  useEffect(() => {
    if(fieldName === "") return;
    setValidity(fieldName, isValid);
  }, [isValid]);
};