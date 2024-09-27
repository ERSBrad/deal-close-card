import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Select,
    Tile
} from "@hubspot/ui-extensions";

import {
    CrmActionButton,
} from "@hubspot/ui-extensions/crm";
import { updateFormField } from "../../utils/reducers";
import { handleErrors } from "../../utils";

export const CompanySelector = ({  fieldName, context, runServerless, sendAlert, currentStep, state, dispatch }) => {

    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(state[currentStep]?.[fieldName]?.value || {
        value: "",
        label: "",
        properties: {}
    });
    const [error, setError] = useState(false);
    //Maybe change below to useState({type: "valid", message: ""}); to eliminate showError? type:"error" for showing error
    const [validationMessage, setValidationMessage] = useState("");
    const [valid, setValid] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, valid, selectedCompany);

    useEffect(() => {
        async function fetchCompanies() {
            let serverlessFunction = await runServerless({
                name: "fetchAssociatedCompanies", parameters: { currentObjectId: context.crm.objectId }
            });
            handleErrors(serverlessFunction, context, setError, setValidationMessage);
            let associatedCompanies = serverlessFunction.response;
            switch(associatedCompanies.length) {
                case 0:
                    setError(true);
                    setValidationMessage("No companies associated with this deal, create a company to continue.");
                    break;
                case 1:
                    setCompanies(associatedCompanies);
                    if(selectedCompany.value === "") {
                        setSelectedCompany(associatedCompanies[0]);
                    }
                    setValid(true);
                    break;
                default:
                    setCompanies(associatedCompanies);
            }
            setLoading(false);
        }
        fetchCompanies();
    }, []);

    const handleSelectChange = (value) => {
        let selectedCompany = companies.find(company => company.value === value);
        setSelectedCompany(selectedCompany);
        setValid(true);
    }

    const handleCrmActionButtonError = async (errors) => {
        console.log(errors);
        let errorMessage = "";
        errors.forEach((error) => {
            errorMessage += `${error}\n`;
        })
        sendAlert({message: errorMessage, type: "danger"});
    }
    //Figure out how to ensure associations between all objects
    //Figure out how to make folders not-required in deal closed cards
    let placeholderText = loading ? "Loading..." : "Select a company";
    
    return (
        <Tile compact>
            <Flex direction="column" gap="xs">
                <Box>
                    <Select
                        label="Select an Associated Company"
                        tooltip="Select the associated company you want to use for closing the sale"
                        required={true}
                        options={companies}
                        value={selectedCompany.value}
                        onChange={(value) => handleSelectChange(value)}
                        placeholder={placeholderText}
                        readOnly={loading || error}
                        error={error}
                        validationMessage={validationMessage}
                    />
                </Box>
                <Box alignSelf="end">
                    <CrmActionButton 
                        size="small"
                        variant="primary"
                        onError={(errors) => handleCrmActionButtonError(errors)}
                        actionType="OPEN_RECORD_ASSOCIATION_FORM"
                        actionContext={{
                            objectTypeId: "0-2",
                            association: {
                                objectTypeId: "0-3",
                                objectId: context.crm.objectId,
                            }
                        }}
                    >
                        { (!loading && !valid) && "Attach Company Now" || "Update Company" }
                    </CrmActionButton>
                </Box>
            </Flex>
        </Tile>
    )
    
}