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

  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [requiredFieldsBySteps, setRequiredFieldsBySteps] = useState([
    [
      "Create Foldername & Associations", 
      {
        "foldername": false,
        "salesRepresentative": false,
        "billingContact": false,
        "billingCompany": false,
      }
    ],
    [
      "Add Line Items", 
      {
        "planTierAdded": false
      }
    ]
  ]);

  const stepNames = requiredFieldsBySteps.map(step => step[0]);
  
  const setValidity = (id, isValid) => {
    let requiredFieldsByStepsCopy = [...requiredFieldsBySteps];
    let currentStepFields = requiredFieldsBySteps[currentStep][1];
    for(const currentStepField in currentStepFields) {
      if(currentStepField === id) {
        console.log(`Setting ${id} to ${isValid}`);
        requiredFieldsByStepsCopy[currentStep][1][id] = isValid;
        break;
      }
    }
    setRequiredFieldsBySteps(requiredFieldsByStepsCopy);
    let currentStepFieldsArray = Object.entries(requiredFieldsByStepsCopy[currentStep][1]);
    let allFieldsValid = currentStepFieldsArray.every(field => field[1] === true);
    console.log(allFieldsValid);
    if(allFieldsValid) {
      setSubmitEnabled(true);
    }
  }

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
        />
      </Box>
      <Form >
        {/* Start splitting this into better components */}
        <Flex direction="column" gap="small" align="stretch">
          <Box flex={1}>
            <FoldernameValidator 
              id="foldername" setValidity={setValidity}
              context={context} 
              runServerless={runServerless} 
            />
          </Box>
          <Box flex={1}>
            <SalesRepresentativeSelector 
              id="salesRepresentative" setValidity={setValidity}
              context={context} 
              runServerless={runServerless} 
              fetchProperties={actions.fetchCrmObjectProperties} 
            />
          </Box>
          <Flex direction="row" gap="small" flex={2}>
            <Box flex={1}>
              <ContactSelector 
                id="billingContact" setValidity={setValidity}
                context={context} 
                runServerless={runServerless} 
              />
            </Box>
            <Box flex={1}>
              <CompanySelector 
                id="billingCompany" setValidity={setValidity}
                context={context} 
                runServerless={runServerless} 
              />
            </Box>
          </Flex>
          <Button
            disabled={!submitEnabled}
            variant={"primary"}
            type={"submit"}
            onClick={handleStepSubmission}
          >
            Submit & Continue
          </Button>
        </Flex>
      </Form>
    </Flex>
  );
};
