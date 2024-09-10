import React, { useState, useEffect } from "react";

export const initialState = {};


/**
 * This is a dynamic method of setting the required field names
 * @param {*} fieldName 
 * @returns 
 */
export const setRequiredFieldName = (fieldName) => {
  const [requiredFieldName, setRequiredFieldName] = useState("");
  useEffect(() => {
    // Dynamically set the id using the provided generator function
    setRequiredFieldName(fieldName());
  }, [requiredFieldName]);
  return requiredFieldName;
};

/**
 * This is used to manage the validity and value of form fields
 * @param {*} state 
 * @param {*} action 
 * @returns Returns the updated state based on the action type
 */
export const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.fieldName]: {
          valid: action.valid,
          value: action.value,
          required: action.required
        }
      };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

/**
 * Dispatches form field updates to formReducer based on the field name, validity, and value
 * @param {*} fieldName 
 * @param {*} valid 
 * @param {*} value 
 * @param {*} dispatch 
 */
export const updateFormField = (dispatch, fieldName, valid, value, required=true) => {
  useEffect(() => {
    if(fieldName === "") return;
    dispatch({ type: "SET_FIELD", fieldName, valid, required, value });
  }, [fieldName, valid, required, value]);
};

/**
 * This currently might be used to navigate between the HubSpot form steps
 * @param {*} state 
 * @param {*} action 
 * @returns Returns the updated state based on the action type
 */
export const stepReducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT_STEP":
      return {
        ...state,
        currentStep: action.currentStep + 1
      };
    case "DECREMENT_STEP":
      let decrementedStep = action.currentStep - 1;
      if(decrementedStep < 0) decrementedStep = 0;
      return {
        ...state,
        currentStep: decrementedStep
      };
    default:
      return state;
  }
};