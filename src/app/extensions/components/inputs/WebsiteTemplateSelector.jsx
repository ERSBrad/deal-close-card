import React, { useEffect, useState } from "react";
import {
    Alert
} from "@hubspot/ui-extensions";
import { formInitialState, updateFormField } from "../../utils/reducers";
import { CrmPropertyList } from "@hubspot/ui-extensions/crm";


export const WebsiteTemplateSelector = ({ fieldName, currentStep, state, dispatch, actions }) => {
  /**
   * Consider using useState([{ label: '', value: '', name: '' }]) instead of an object?
   */

  const propertyNameList = [
    'sandbox___website_type',
    'sandbox___website_template',
    'actual_unit__'
  ];
  const [properties, setProperties] = useState({});
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(false);
  updateFormField(dispatch, currentStep, fieldName, valid, properties);

  useEffect(() => {
    const getCurrentPropertyValues = async () => {
      const fetchedProperties = await actions.fetchCrmObjectProperties(propertyNameList);
      updateProperties(fetchedProperties);
    };
    getCurrentPropertyValues();
  }, []);

  useEffect(() => {
    console.log("properties", properties);
    console.log("propertyCount", Object.keys(properties).length);
    const allPropertiesValid = Object.values(properties).every(value => value);
    console.log(allPropertiesValid);
    setValid(allPropertiesValid);
  }, [properties]);

  const updateProperties = (updatedProperties, error) => {
    if(error) {
      console.log(error.message);
      setValidationMessage("An error occurred while fetching properties, please try again.");
      setError(true);
      return;
    }
    let propertyClone = properties;
    propertyClone = { ...propertyClone, ...updatedProperties };
    setProperties(propertyClone);
  };

  actions.onCrmPropertiesUpdate(propertyNameList, updateProperties);

  return (
    <>
      {error && (
        <Alert variant="error">{validationMessage}</Alert>
      )}
      <CrmPropertyList
        properties={propertyNameList}
      />
    </>
  );

};