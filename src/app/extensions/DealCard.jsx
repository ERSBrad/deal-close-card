import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Button,
  Form,
  hubspot,
  StepIndicator,
} from "@hubspot/ui-extensions";

import {
  Step1,
  Step2
} from "./components/steps";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    actions={actions}
  />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({ 
  actions,
  context, 
  sendAlert,
  runServerless, 
}) => {

  const appJson = {
    "settings": {
      "teams": {
        "sales": {
          "ers": {
            "id": "49960194"
          },
          "drs": {
            "id": "49960165"
          }
        }
      }
    }
  };

  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const stepNames = [
    'New Deal Information',
    "Setup Line Items"
  ];

  const handleStepSubmission = () => {
    sendAlert({ message: "Step Submitted", type: "success" });
  }

  return (
    <Flex direction="column" gap="large" align="stretch">
      <Box alignSelf="center">
        <StepIndicator 
          currentStep={currentStep} 
          stepNames={stepNames}
          circleSize="large"
          variant="flush"
          appJson={appJson}
        />
      </Box>
      <Form >
        {/* Start splitting this into better components */}
        <Step1
          context={context} 
          runServerless={runServerless} 
          actions={actions}
          appJson={appJson}
          handleStepSubmission={handleStepSubmission}
        />
      </Form>
    </Flex>
  );
};
