import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Divider,
  Button,
  Form,
  hubspot,
  StepIndicator,
} from "@hubspot/ui-extensions";

import {
  SalesRepresentativeSelector,
  FoldernameValidator,
  ContactSelector,
  CompanySelector,
} from "./components";

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

  const stepNames = [
    "Create Foldername & Associations", 
    "Add Line Items", 
    "Confirm Billing Address", 
    "Confirm Shipping Address", 
    //Move Schedule last step if possible, but it gives time for info to be sent to NetSuite
    "Schedule Onboarding", 
    "Collect Payment"
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  function handleEnter(event) {
    if (event.keyCode === 13) {
      const form = event.target.form;
      console.log(form);
      const index = Array.prototype.indexOf.call(form, event.target);
      form.elements[index + 1].focus();
      event.preventDefault();
    }
  }
  
  return (
    <Flex direction="column" gap="large" align="stretch">
      <Box alignSelf="center">
        <StepIndicator 
          currentStep={currentStep} 
          stepNames={stepNames}
          circleSize="large"
          variant="flush"
        />
      </Box>
      <Form >
        {/* Start splitting this into better components */}
        <Flex direction="column" gap="small" align="stretch">
          <FoldernameValidator context={context} runServerless={runServerless} onKeyDown={handleEnter} />
          <SalesRepresentativeSelector context={context} runServerless={runServerless} fetchProperties={actions.fetchCrmObjectProperties} />
          <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
              <ContactSelector context={context} runServerless={runServerless}  onKeyDown={handleEnter} />
            </Box>
            <Box flex={1}>
              <CompanySelector context={context} runServerless={runServerless} sendAlert={sendAlert} onKeyDown={handleEnter} />
            </Box>
          </Flex>
          <Button
            disabled={!submitEnabled}
            variant={"primary"}
            type={"submit"}
          >
            Submit & Continue
          </Button>
        </Flex>
      </Form>
    </Flex>
  );
};
