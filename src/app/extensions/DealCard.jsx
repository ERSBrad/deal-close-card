import React, { useEffect, useState, useReducer } from "react";
import {
  hubspot,
  Box,
  Divider,
  ErrorState,
  Flex,
  Form,
  Heading,
  Image,
  LoadingSpinner,
  StepIndicator,
  Text,
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
  context.settings  = {
    teams: {
      sales: {
        ers: { id: "49960194" },
        drs: { id: "49960165" }
      }
    }
  };

  const stepInitialState = { currentStep: 0 };
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [stepState, stepDispatch] = useReducer(stepReducer, stepInitialState);
  const [formState, formDispatch] = useReducer(formReducer, formInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const stepNames = ["Add Deal Information", "Add Services Sold"];
  const [unlockedSteps, setUnlockedSteps] = useState([]);

  useEffect(() => {
    let dealProperties = context.properties;
  })
  
  useEffect(() => {
    if(!formState.hasOwnProperty(currentStep)) return;
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

  const handleSubmit = async (e) => {
    const dealProperties = await actions.fetchCrmObjectProperties('*');
    setSubmitting(true);
    let serverlessFunction = await runServerless({ name: "ersCreateFolder", parameters: { formState, dealProperties } });
    if(serverlessFunction.status === "ERROR") {
      console.log(serverlessFunction.message);
      setValidationMessage("An error occurred while processing your request. Try again or contact an administrator.");
      setSubmissionError(true);
    } else {
      console.log(serverlessFunction);
      setSubmitted(true);
      setSubmissionError(false);
      setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="large" align="stretch">
      <Divider distance="xl" />
      {(!submitting && !submitted) && (
        <>
          <Box alignSelf="center">
            <StepIndicator 
              currentStep={currentStep}
              stepNames={stepNames}
              circleSize="large"
              variant="flush"
              onClick={(step) => handleStepClick(step)}
            />
          </Box>
          <Form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <Step1
                context={context}
                runServerless={runServerless}
                actions={actions}
                handleStepSubmission={handleStepSubmission}
                formState={formState}
                formDispatch={formDispatch}
                enableSubmit={enableSubmit}
                currentStep={currentStep}
                handlePreviousStep={handlePreviousStep}
              />
            )}
            {currentStep === 1 && (
              <Step2
                context={context}
                runServerless={runServerless}
                actions={actions}
                handleStepSubmission={handleStepSubmission}
                formState={formState}
                formDispatch={formDispatch}
                enableSubmit={enableSubmit}
                currentStep={currentStep}
                handlePreviousStep={handlePreviousStep}
              />
            )}
          </Form>
        </>
      )}
      {(submitting && !submitted && !submissionError) && (
        <Flex direction="column" gap="large" align="center" justify="center">
          {/*<Image
              src="https://9145732.fs1.hubspotusercontent-na1.net/hubfs/9145732/ui-extensions/sending-icon-hs.png"
              width={60}
          />*/}
          <Flex direction="column" gap="small" align="center">
            <Heading inline={true}>
              <Text format={{
                fontWeight: 'bold'
              }}>Processing New Deal! Please Wait...</Text>
            </Heading>
            <LoadingSpinner
              size="medium"
              layout="centered"
              showLabel={true}
              label="Submitting..."
            />
          </Flex>
        </Flex>
      )}
      {(submitting && !submitted && submissionError) && (
        <Flex direction="column" gap="large" align="center" justify="center">
          <ErrorState
            title="An Error Occurred While Submitting The Form"
              type="error"
          />
          <Text>{validationMessage}</Text>
        </Flex>
      )}
      {submitted && !submissionError && (
          <Flex direction="column" gap="large" align="center" justify="center">
            <Image
              src="https://9145732.fs1.hubspotusercontent-na1.net/hubfs/9145732/success-image-custom-component.png"
              width={60}
            />
            <Flex direction="column" gap="small" align="center">
              <Heading inline={true}>
                <Text format={{ 
                  fontWeight: 'bold' 
                }}>New Deal Was Processed Successfully!</Text>
              </Heading>
              <Text>A welcome email will be dispatched to the customer shortly discussing onboarding and the next steps.</Text>
            </Flex>
          </Flex>
      )}
      <Divider distance="xl" />
    </Flex>
  );

};
