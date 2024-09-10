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

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step1 = ({ 
  actions,
  context,
  runServerless,
  handleStepSubmission,
  fetchProperties,
  appJson,
  enableSubmit,
  formState,
  formDispatch
}) => {

    /**
     * A system to add dynamic form validation to all form components.
     * Follow the props of the components to see how they interact with this system.
     */

    return (
        <Flex direction="column" gap="small" align="stretch">
            <Box flex={1}>
                <FoldernameValidator 
                    fieldName={"foldername"}
                    context={context} 
                    runServerless={runServerless} 
                    state={formState}
                    dispatch={formDispatch}
                />
            </Box>
            <Box flex={1}>
                <SalesRepresentativeSelector 
                    fieldName={"salesRepresentative"}
                    context={context} 
                    runServerless={runServerless} 
                    fetchProperties={actions.fetchCrmObjectProperties} 
                    appJson={appJson}
                    state={formState}
                    dispatch={formDispatch}
                    />
            </Box>
            <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
                <ContactSelector 
                    fieldName={"billingContact"}
                    context={context} 
                    runServerless={runServerless} 
                    state={formState}
                    dispatch={formDispatch}
                />
            </Box>
            <Box flex={1}>
                <CompanySelector 
                    fieldName={"billingCompany"}
                    context={context} 
                    runServerless={runServerless} 
                    state={formState}
                    dispatch={formDispatch}
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
