import { useEffect } from "react";

export const formInitialState = {};

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
        [action.currentStep]: {
          ...state[action.currentStep],
          [action.fieldName]: {
            valid: action.valid,
            value: action.value,
            required: action.required
          }
        }
      };
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
export const updateFormField = (dispatch, currentStep, fieldName, valid, value, required=true) => {
  useEffect(() => {
    if(fieldName === "") return;
    dispatch({ type: "SET_FIELD", currentStep, fieldName, valid, required, value });
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
        currentStep: action.currentStep + 1,
      };

    case "DECREMENT_STEP":
      return {
        ...state,
        currentStep: Math.max(0, action.currentStep - 1),
      };

    default:
      return state;
  }
};