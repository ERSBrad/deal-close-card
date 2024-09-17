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
  enableSubmit,
  formState,
  formDispatch,
  currentStep,
  handlePreviousStep
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
                    currentStep={currentStep}
                />
            </Box>
            <Box flex={1}>
                <SalesRepresentativeSelector 
                    fieldName={"salesRepresentative"}
                    context={context} 
                    runServerless={runServerless} 
                    fetchProperties={actions.fetchCrmObjectProperties}
                    state={formState}
                    dispatch={formDispatch}
                    currentStep={currentStep}
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
                    currentStep={currentStep}
                />
            </Box>
            <Box flex={1}>
                <CompanySelector 
                    fieldName={"billingCompany"}
                    context={context} 
                    runServerless={runServerless} 
                    state={formState}
                    dispatch={formDispatch}
                    currentStep={currentStep}
                />
            </Box>
            </Flex>
            <Box alignSelf="center">
                {(currentStep > 0) && (
                    <Button variant="secondary" onClick={handlePreviousStep}>Previous Step</Button>
                )}
                <Button variant="primary" onClick={handleStepSubmission} disabled={!enableSubmit}>Submit & Continue</Button>
            </Box>
        </Flex>
    );
};
