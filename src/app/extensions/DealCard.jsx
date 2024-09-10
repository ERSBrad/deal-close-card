import React, { useEffect, useState, useReducer } from "react";
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

import { stepReducer } from "./utils";

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

  const stepInitialState = { 
    currentStep: 0,
  };

  const [multiStepFormState, multiStepFormDispatch] = useReducer(stepReducer, stepInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const stepNames = [
    "New Deal Information",
    "Setup Line Items",
    "Setup Other Items"
  ];

  useEffect(() => {
    setCurrentStep(multiStepFormState.currentStep);
  }, [multiStepFormState.currentStep]);

  const [achievedSteps, setAchievedSteps] = useState([]);
  const stepHasBeenAchieved = (step) => {
    return achievedSteps.includes(step);
  }

  useEffect(() => {
    let updatedAchievedSteps = achievedSteps;
    updatedAchievedSteps.push(multiStepFormState.currentStep);
    setAchievedSteps(updatedAchievedSteps);
  }, [currentStep]);

  const handleStepSubmission = () => {
    sendAlert({ message: "Step Submitted", type: "success" });
  }

  const handleStepClick = (requestedStep) => {
    console.log("requestedStep", requestedStep);
    if (currentStep < requestedStep && stepHasBeenAchieved(requestedStep)) {
      console.log("INCREMENT_STEP");
      multiStepFormDispatch({ type: "INCREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
    } else if (currentStep > requestedStep) {
      console.log("DECREMENT_STEP");
      multiStepFormDispatch({ type: "DECREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
    }
  };

  return (
    <Flex direction="column" gap="large" align="stretch">
      <Box alignSelf="center">
        <StepIndicator 
          currentStep={currentStep} 
          stepNames={stepNames}
          circleSize="large"
          variant="flush"
          appJson={appJson}
          onClick={(step) => handleStepClick(step)}
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
