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
export const Step2 = ({ 
  actions,
  context, 
  sendAlert,
  runServerless,
  fetchProperties,
  setValidity,
}) => {

    const [submitEnabled, setSubmitEnabled] = useState(false);

    const handleStepSubmission = () => {
        sendAlert({ message: "Step Submitted", type: "success" });
    }

    return (
        <Flex direction="column" gap="small" align="stretch">
            <Box flex={1}>
                <FoldernameValidator 
                    id="foldername" 
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            <Box flex={1}>
                <SalesRepresentativeSelector 
                    id="salesRepresentative" 
                    context={context} 
                    runServerless={runServerless} 
                    fetchProperties={actions.fetchCrmObjectProperties} 
                    />
            </Box>
            <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
                <ContactSelector 
                    id="billingContact" 
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            <Box flex={1}>
                <CompanySelector 
                    id="billingCompany" 
                    context={context} 
                    runServerless={runServerless} 
                />
            </Box>
            </Flex>
            <Button
                disabled={!submitEnabled}
                variant={"primary"}
                type={"submit"}
                onClick={handleStepSubmission}
            >
                fieldName={"foldername"}
                Submit & Continue
            </Button>
        </Flex>
    );
};
