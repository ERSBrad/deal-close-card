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

export const CompanySelector = ({ context, runServerless, sendAlert }) => {

    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState({
        value: "",
        label: "",
        properties: {}
    });
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState("");

    useEffect(() => {
        async function fetchCompanies() {
            let serverlessFunction = await runServerless({
                name: "fetchAssociatedCompanies", parameters: { currentObjectId: context.crm.objectId }
            });
            if(serverlessFunction.status !== 'SUCCESS') throw new Error(serverlessFunction.message);
            let associatedCompanies = serverlessFunction.response;
            switch(associatedCompanies.length) {
                case 0:
                    setIsValid(false);
                    setValidationMessage("No companies found for this deal, please create a company first.");
                    break;
                case 1:
                    setCompanies(associatedCompanies);
                    setSelectedCompany(associatedCompanies[0]);
                    setIsValid(true);
                    break;
                default:
                    setCompanies(associatedCompanies);
                    setIsValid(true);
            }
            setLoading(false);
        }
        fetchCompanies();
    }, []);

    const handleSelectChange = (value) => {
        let selectedCompany = companies.find(company => company.value === value);
        setSelectedCompany(selectedCompany);
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
    let hasSelectedCompany = selectedCompany.value !== "";
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
                        readOnly={loading || !isValid}
                        error={!isValid}
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
                        { (!loading && !isValid) && "Add a Company Now" || "Add New Company" }
                    </CrmActionButton>
                </Box>
            </Flex>
        </Tile>
    )
    
}