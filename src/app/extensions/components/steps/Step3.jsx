import React, { useEffect, useState } from "react";
import {
    Flex,
    Box,
    Button,
    Text,
    Tile,
    Checkbox
} from "@hubspot/ui-extensions";
import { ContactAddressValidator, CompanyAddressValidator } from "../inputs";

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step3 = ({ 
  actions,
  context,
  runServerless,
  handleStepSubmission,
  formState,
  formDispatch,
  enableSubmit,
  currentStep,
  handlePreviousStep
}) => {

    return (
        <Flex direction={'column'} gap={'medium'}>
            <Box>
                <ContactAddressValidator
                    context={context}
                    fieldName={'contactAddress'}
                    currentStep={currentStep}
                    state={formState}
                    dispatch={formDispatch}
                />
            </Box>
            <Box>
                <CompanyAddressValidator
                    context={context}
                    fieldName={'contactAddress'}
                    currentStep={currentStep}
                    state={formState}
                    dispatch={formDispatch}
                />
            </Box>
            <Box alignSelf="center">
                {(currentStep > 0) && (
                    <Button variant="secondary" onClick={handlePreviousStep}>Previous Step</Button>
                )}
                <Button variant="primary" type="submit" disabled={!enableSubmit}>Submit & Continue</Button>
            </Box>
        </Flex>
    );
};
