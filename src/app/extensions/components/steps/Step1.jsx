import React, { useEffect, useReducer, useState } from "react";
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

import { formReducer, formInitialState } from "../../utils";

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

    const [enableSubmit, setEnableSubmit] = useState(false);
    const [stepState, stepDispatch] = useReducer(formReducer, formInitialState);

    useEffect(() => {
        let shouldEnableSubmit = Object.values(stepState).every(field => field.valid);
        setEnableSubmit(shouldEnableSubmit);
    }, [stepState]);

    return (
        <Flex direction="column" gap="small" align="stretch">
            <Box flex={1}>
                <FoldernameValidator 
                    fieldName={"foldername"}
                    context={context} 
                    runServerless={runServerless} 
                    state={stepState}
                    dispatch={stepDispatch}
                />
            </Box>
            <Box flex={1}>
                <SalesRepresentativeSelector 
                    fieldName={"salesRepresentative"}
                    context={context} 
                    runServerless={runServerless} 
                    fetchProperties={actions.fetchCrmObjectProperties} 
                    appJson={appJson}
                    state={stepState}
                    dispatch={stepDispatch}
                    />
            </Box>
            <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
                <ContactSelector 
                    fieldName={"billingContact"}
                    context={context} 
                    runServerless={runServerless} 
                    state={stepState}
                    dispatch={stepDispatch}
                />
            </Box>
            <Box flex={1}>
                <CompanySelector 
                    fieldName={"billingCompany"}
                    context={context} 
                    runServerless={runServerless} 
                    state={stepState}
                    dispatch={stepDispatch}
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
