import React, { useEffect, useState } from "react";
import {
    Flex,
    Box,
    Button,
    Text,
    Tile
} from "@hubspot/ui-extensions";

import {
    LineItems,
    WebsiteTemplateSelector
} from "../inputs";

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step2 = ({ 
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

    const createErsFolder = async (formState) => {

    }

    return (
        <Flex direction={'column'} gap={'medium'}>
            <Box>
                <Tile compact>
                    <LineItems 
                        context={context}
                        fieldName={'lineItems'}
                        state={formState}
                        dispatch={formDispatch}
                        runServerless={runServerless}
                        actions={actions}
                        currentStep={currentStep}
                    />
                </Tile>
            </Box>
            <Box>
                <Tile compact>
                    <WebsiteTemplateSelector
                        context={context} 
                        fieldName={'websiteTemplate'}
                        actions={actions}
                        state={formState}
                        dispatch={formDispatch}
                        currentStep={currentStep}
                    />
                </Tile>
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
