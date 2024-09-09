import React, { useEffect, useState } from "react";
import {
    Flex,
    Box,
    Button,
} from "@hubspot/ui-extensions";

import {
    SalesRepresentativeSelector,
    FoldernameValidator,
    ContactSelector,
    CompanySelector,
} from "../inputs";

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step1 = ({ 
  actions,
  context,
  runServerless,
  handleStepSubmission,
  fetchProperties,
  appJson
}) => {

    /**
     * A system to add dynamic form validation to all form components.
     * Follow the props of the components to see how they interact with this system.
     */
    const [requiredFields, setRequiredFields] = useState({});
    const [enableSubmit, setEnableSubmit] = useState(false);
    const fieldNameGenerator = (fieldName) => (() => {
        setRequiredFields((prev) => ({ ...prev, [fieldName]: false }));
        return fieldName;
    });


    const setValidity = (fieldName, isValid) => {
        setRequiredFields((prev) => ({ ...prev, [fieldName]: isValid }));
    }

    useEffect(() => {
        console.log(requiredFields);
        let enableSubmit = Object.entries(requiredFields).every(([fieldName, isValid]) => isValid);
        setEnableSubmit(enableSubmit);
    });

    return (
        <Flex direction="column" gap="small" align="stretch">
            <Box flex={1}>
                <FoldernameValidator 
                    fieldNameGenerator={fieldNameGenerator("foldername")}
                    setValidity={setValidity}
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            <Box flex={1}>
                <SalesRepresentativeSelector 
                    fieldNameGenerator={fieldNameGenerator("salesRepresentative")}
                    setValidity={setValidity}
                    context={context} 
                    runServerless={runServerless} 
                    fetchProperties={actions.fetchCrmObjectProperties} 
                    appJson={appJson}
                    />
            </Box>
            <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
                <ContactSelector 
                    fieldNameGenerator={fieldNameGenerator("billingContact")}
                    setValidity={setValidity}
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            <Box flex={1}>
                <CompanySelector 
                    fieldNameGenerator={fieldNameGenerator("billingCompany")}
                    setValidity={setValidity}
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            </Flex>
            <Button
                disabled={!enableSubmit}
                variant={"primary"}
                type={"submit"}
                onClick={handleStepSubmission}
            >
                
                Submit & Continue
            </Button>
        </Flex>
    );
};
