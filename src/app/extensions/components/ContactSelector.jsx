import React, { useState, useEffect } from "react";
import {
  Select,
  Tile,
  Flex,
  Box
} from "@hubspot/ui-extensions";

import {
    CrmActionButton,
} from "@hubspot/ui-extensions/crm";

import {

} from "@hubspot/ui-extensions/experimental";

export const ContactSelector = ({ context, runServerless }) => {

    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState({
        value: "",
        label: "",
        properties: {}
    });
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState("");

    useEffect(() => {
        async function fetchContacts() {
            let serverlessFunction = await runServerless({
                name: "fetchAssociatedContacts", parameters: { currentObjectId: context.crm.objectId }
            });
            console.log(serverlessFunction);
            if(serverlessFunction.status !== 'SUCCESS') throw new Error(serverlessFunction.message);
            let associatedContacts = serverlessFunction.response;
            switch(associatedContacts.length) {
                case 0:
                    setIsValid(false);
                    setValidationMessage("No contacts found for this deal, please create a contact first.");
                    break;
                case 1:
                    setContacts(associatedContacts)
                    setSelectedContact(associatedContacts[0]);
                    setIsValid(true);
                    break;
                default:
                    setContacts(associatedContacts);
                    setIsValid(true);
                    break;
            }
            setLoading(false);
        }
        fetchContacts();
    }, []);

    const handleSelectChange = (value) => {
        let selectedContact = contacts.find(contact => contact.value === value);
        setSelectedContact(selectedContact);
    }
    let hasSelectedContact = selectedContact.value !== "";
    let placeholderText = loading ? "Loading..." : "Select a contact";
    
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
                        error={!isValid}
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
                        { (!loading && !isValid) && "Add a Contact Now" || "Add New Contact" }
                    </CrmActionButton>
                </Box>
            </Flex>
        </Tile>
    )
    
}