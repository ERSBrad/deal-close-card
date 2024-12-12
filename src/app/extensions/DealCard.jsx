import React, { useEffect, useState, useReducer } from "react";
import {
  hubspot,
  Box,
  Button,
  Divider,
  ErrorState,
  Flex,
  Form,
  Heading,
  Image,
  LoadingSpinner,
  StepIndicator,
  Text
} from "@hubspot/ui-extensions";
 
import {
  Step1,
  Step2,
  Step3
} from "./components/steps";

import { stepReducer, formReducer, formInitialState } from "./utils/reducers";
import { loadExtensionSettings } from "./utils/settings";
import { openOnboardingMeetingIframe, openPaymentCaptureIframe } from "./utils";
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

  //TODO: context.actions = actions; //Leaving it out for now, would clean up a lot of props though

  const stepInitialState = { currentStep: 0 };
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [stepState, stepDispatch] = useReducer(stepReducer, stepInitialState);
  const [formState, formDispatch] = useReducer(formReducer, formInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const stepNames = ["Add Deal Information", "Add Line Items", "Contact & Company Address"];
  const [unlockedSteps, setUnlockedSteps] = useState([]);
  const [paymentTokenCaptured, setPaymentTokenCaptured] = useState(false);
  const [requiredDataAvailable, setRequiredDataAvailable] = useState(false);

  context.actions = actions;
  context.runServerless = runServerless;
  /**
   * Steps are set using arrays, so the first step is 0, second step is 1, etc.
   */
  context.scheduleOnboardingMeetingStep = 2;
  loadExtensionSettings(context, setLoadingSettings);

  useEffect(() => {
    console.debug("context", context);
    console.debug("formState", formState);
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
      stepDispatch({ type: "INCREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
    } else if (requestedStep < currentStep) {
      stepDispatch({ type: "DECREMENT_STEP", currentStep: currentStep, requestedStep: requestedStep });
    }
  };

  const handleSubmit = async (e) => {
    openOnboardingMeetingIframe(context);
    setSubmitting(true);
    /**
     * TODO: Have this return the new properties that Workato should've added 
     * (maybe it can be auto refreshed on the client UX extension side?) while
     * onboarding iframe is open. Use a callback once onboarding iframe closes
     * and then use the new data to load the payment form if the properties are
     * present.
     */
    let serverlessFunction = await runServerless({ name: "submitDealClose", parameters: { formState, clientContext: context } });
    if(serverlessFunction.status === "ERROR") {
      console.error(serverlessFunction.message);
      setValidationMessage("An error occurred while processing your request. Try again or contact an administrator.");
      setSubmissionError(true);
    } else {
      setSubmitted(true);
      setSubmissionError(false);
      setSubmitting(false);
    }
  };

  const openPaymentCaptureModal = async (e) => {
    console.log("DCC oPCM: ", context);
    openPaymentCaptureIframe(context);
  }

  return (
    <Flex direction="column" gap="large" align="stretch">
      <Divider distance="xl" />
        {loadingSettings ? (
          <LoadingSpinner 
            size="medium"
            label="Loading Extension..."
            layout="centered"
          />
        ) : (
          <>
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
                <Form 
                  //onSubmit={handleSubmit}
                >
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
                  {currentStep === 2 && (
                    <Step3
                      context={context}
                      runServerless={runServerless}
                      actions={actions}
                      handleSubmit={handleSubmit}
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
            {(submitted && !paymentTokenCaptured && !submissionError) && (
                <Flex direction="column" gap="large" align="center" justify="center">
                  <Image
                    src="https://9145732.fs1.hubspotusercontent-na1.net/hubfs/9145732/ui-extensions/sending-icon-hs.png"
                    width={60}
                  />
                  <Flex direction="column" gap="small" align="center">
                    <Heading inline={true}>
                      <Text format={{
                        fontWeight: 'bold'
                      }}>Ready to Capture Payment Token</Text>
                    </Heading>
                    <Text>Click the button below to capture the payment token.</Text>
                    <Button onClick={openPaymentCaptureModal}>Capture Payment Token</Button>
                  </Flex>
                </Flex>
            )}
            {(submitted && paymentTokenCaptured && !submissionError) && (
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
          </>
        )}
      <Divider distance="xl" />
    </Flex>
  );

};
