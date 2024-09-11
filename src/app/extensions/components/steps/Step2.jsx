import React, { useEffect, useState } from "react";
import {
    Flex,
    Box,
    Button,
    Text
} from "@hubspot/ui-extensions";

import {
    LineItems
} from "../inputs";

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step2 = ({ 
  actions,
  context, 
  sendAlert,
  runServerless,
  fetchProperties,
  setValidity,
  handleStepSubmission,
  formState,
  formDispatch,
  enableSubmit
}) => {

    return (
        <Flex direction={'column'} gap={'medium'}>
            <Box>
                <LineItems 
                    context={context}
                    fieldName={'lineItems'}
                    state={formState}
                    dispatch={formDispatch}
                    runServerless={runServerless}
                    actions={actions}
                />
            </Box>
        </Flex>
    );
};
