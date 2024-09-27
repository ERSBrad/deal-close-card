import React, { useState, useEffect } from "react";
import {
  Select,
  Tile,
  Flex,
  Box,
} from "@hubspot/ui-extensions";

import {
    CrmActionButton
} from "@hubspot/ui-extensions/crm";

import { updateFormField } from "../../utils/reducers";
import { handleErrors } from "../../utils";

export const ContactSelector = ({ id, setValidity, fieldName, context, runServerless, currentStep, state, dispatch }) => {

    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(state[currentStep]?.[fieldName]?.value || {
        value: "",
        label: "",
        properties: {}
    });
    const [error, setError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [valid, setValid] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, valid, selectedContact);

    let placeholderText = loading ? "Loading..." : "Select a contact";

    useEffect(() => {
        async function fetchContacts() {
            let serverlessFunction = await runServerless({
                name: "fetchAssociatedContacts", parameters: { currentObjectId: context.crm.objectId }
            });
            handleErrors(serverlessFunction, context, setError, setValidationMessage);
            let associatedContacts = serverlessFunction.response;
            switch(associatedContacts.length) {
                case 0:
                    setError(true);
                    setValidationMessage("No contacts found for this deal, please create a contact first.");
                    break;
                case 1:
                    setContacts(associatedContacts)
                    if(selectedContact.value === "") {
                        setSelectedContact(associatedContacts[0]);
                    }
                    setValid(true);
                    break;
                default:
                    setContacts(associatedContacts);
                    setValid(true);
                    break;
            }
            setLoading(false);
        }
        fetchContacts();
    }, []);

    const handleCrmActionButtonError = async (errors) => {
        console.log(errors);
        let errorMessage = "";
        errors.forEach((error) => {
            errorMessage += `${error}\n`;
        })
        sendAlert({message: errorMessage, type: "danger"});
    }

    const handleSelectChange = (value) => {
        let selectedContact = contacts.find(contact => contact.value === value);
        setSelectedContact(selectedContact);
    }
    
    return (
        <Tile compact>
            <Flex direction="column" gap="xs">
                <Box>
                    <Select
                        label="Select a Billing Contact"
                        tooltip="Select the associated contact you want to use for closing the sale"
                        required={true}
                        options={contacts}
                        value={selectedContact.value}
                        onChange={(value) => handleSelectChange(value)}
                        placeholder={placeholderText}
                        readOnly={loading}
                        error={error}
                        validationMessage={validationMessage}
                    />
                </Box>
                <Box alignSelf="end">
                    <CrmActionButton 
                        actionType="OPEN_RECORD_ASSOCIATION_FORM"
                        actionContext={{
                            objectTypeId: "0-1",
                            association: {
                                objectTypeId: "0-3",
                                objectId: context.crm.objectId,
                            }
                        }}
                        variant="primary"
                        size="small"
                        onError={(errors) => handleCrmActionButtonError(errors)}
                    >
                        { (!loading && !valid) && "Attach Contact Now" || "Update Contact" }
                    </CrmActionButton>
                </Box>
            </Flex>
        </Tile>
    )
    
}