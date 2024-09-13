import React, { useEffect, useState, useReducer } from "react";
import {
  Flex,
  Box,
  Button,
  Text,
  Form,
  hubspot,
  StepIndicator,
} from "@hubspot/ui-extensions";

import {
  Step1,
  Step2
} from "./components/steps";

import { stepReducer, formReducer, formInitialState } from "./utils/reducers";

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

  /**
   * Convert this to an API call that pulls the sales teams IDs from the CRM via the portalId.
   */
  const appJson = {
    settings: {
      teams: {
        sales: {
          ers: { id: "49960194" },
          drs: { id: "49960165" }
        }
      }
    }
  };

  const stepInitialState = { currentStep: 0 };
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [stepState, stepDispatch] = useReducer(stepReducer, stepInitialState);
  const [formState, formDispatch] = useReducer(formReducer, formInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const stepNames = ["Add Deal Information", "Add Services Sold", "Confirm Billing Information"];
  const [unlockedSteps, setUnlockedSteps] = useState([]);

  useEffect(() => {
    if(!formState.hasOwnProperty(currentStep)) return;
    console.log("formState", formState);
    let currentStepsFormFields = formState[currentStep];
    let shouldEnableSubmit = Object.values(currentStepsFormFields).every(field => field.valid);
    setEnableSubmit(shouldEnableSubmit);
  }, [formState]);

  useEffect(() => {
    setCurrentStep(stepState.currentStep);
  }, [stepState.currentStep]);

  useEffect(() => {
    setUnlockedSteps((prevAchievedSteps) => {
      if (!prevAchievedSteps.includes(currentStep)) {
        return [...prevAchievedSteps, currentStep];
      }
      return prevAchievedSteps;
    });
  }, [currentStep]);

  /*useEffect(() => { 
    console.log("formState", formState);
  }, [formState]);*/

  const stepIsUnlocked = (step) => {
    return unlockedSteps.includes(step);
  }

  const handleStepSubmission = () => {
    stepDispatch({ type: "INCREMENT_STEP", currentStep });
  };

  const handlePreviousStep = () => {
    stepDispatch({ type: "DECREMENT_STEP", currentStep });
  }

  const handleStepClick = (requestedStep) => {
    let stepsUnlocked = stepIsUnlocked(requestedStep);
    if(!stepsUnlocked) {
      sendAlert({ message: `You Must ${stepNames[unlockedSteps.at(-1)]} First`, type: "warning" });
      return;
    }
    if (requestedStep > currentStep) {
      console.log("INCREMENT_STEP");
      stepDispatch({ type: "INCREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
    } else if (requestedStep < currentStep) {
      console.log("DECREMENT_STEP");
      stepDispatch({ type: "DECREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
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
      <Form>
        {currentStep === 1 && (
          <Step1
            context={context}
            runServerless={runServerless}
            actions={actions}
            appJson={appJson}
            handleStepSubmission={handleStepSubmission}
            formState={formState}
            formDispatch={formDispatch}
            enableSubmit={enableSubmit}
            currentStep={currentStep}
            handlePreviousStep={handlePreviousStep}
          />
        )}
        {currentStep === 0 && (
          <Step2
            context={context}
            runServerless={runServerless}
            actions={actions}
            appJson={appJson}
            handleStepSubmission={handleStepSubmission}
            formState={formState}
            formDispatch={formDispatch}
            enableSubmit={enableSubmit}
            currentStep={currentStep}
            handlePreviousStep={handlePreviousStep}
          />
        )}
      </Form>
    </Flex>
  );

};
