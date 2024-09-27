import React, { useEffect, useState } from "react";
import {
    Alert,
    Heading,
    Tile,
    Flex,
    Box
} from "@hubspot/ui-extensions";
import { flattenFormState } from "../../utils";
import { updateFormField } from "../../utils/reducers";
import { CrmAssociationPropertyList } from "@hubspot/ui-extensions/crm";


export const ContactAddressValidator = ({ context, fieldName, currentStep, state, dispatch, contactSelectorFieldname = 'billingContact' }) => {

  const propertyNameList = [
    'firstname',
    'lastname',
    'phone',
    'email',
    'address',
    'city',
    'state',
    'zip',
    'country',
  ];
  
  const [properties, setProperties] = useState({});
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [billingContact, setBillingContact] = useState({})
  updateFormField(dispatch, currentStep, fieldName, valid, properties);

  useEffect(() => {
    const getCurrentPropertyValues = async () => {
      /**
       * TODO: Perform check to ensure form fields are up-to-date
       * Could potentially become out of sync if someone edits the billing contact
       * after starting the form. Might be worth adding a check to ensure it's current.
       */
      const formData = flattenFormState(state);
      setBillingContact(formData[contactSelectorFieldname]?.value || {});
    };
    getCurrentPropertyValues();
  }, []);

  useEffect(() => {
    if(Object.keys(billingContact).length === 0) {
      setValidationMessage("The form does not contain a billing contact. Try completing the form again or contact internal HS support.");
      setError(true);
      return;
    }
    setError(false);
    setValidationMessage("");
    updateProperties(billingContact.properties);
    console.log("billingContact", billingContact);
    console.log("billingContact.properties", billingContact.properties);
  }, [billingContact]);

  useEffect(() => {
    /**
     * Disabling allPropertiesValid until onCrmPropertiesUpdate() triggers an update
     * for changes to associated objects properties, or until HubSpot implements 
     * similar functionality for associated objects. This is what disables the submit
     * button until all properties are valid.
     * 
     * const allPropertiesValid = Object.values(properties).every(value => value);
     */
    setValid(true);
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
    
  /**
   * This doesn't trigger on associated objects property modifications. It only works
   * for the object that's in context of the ui extension
   * 
   * context.actions.onCrmPropertiesUpdate(propertyNameList, updateProperties);
   */

  return (
    <Flex direction={'column'} gap={'small'}>
      <Box>
        <Heading
          inline
        >
          Confirm Billing Address
        </Heading>
      </Box>
      <Box>
        <Tile compact>
          {error && (
            <Alert variant="error">{validationMessage}</Alert>
          )}
          <CrmAssociationPropertyList
            objectTypeId="0-1"
            properties={propertyNameList}
            filters={[{
                "operator": "EQ",
                "property": "hs_object_id",
                "value": properties.hs_object_id
            }]}
          />
        </Tile>
      </Box>
    </Flex>
  );

};