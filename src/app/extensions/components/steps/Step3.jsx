import React, { useEffect, useState } from "react";
import {
    Flex,
    Box,
    Button,
    LoadingButton,
    Alert,
    Text
} from "@hubspot/ui-extensions";
import { ContactAddressValidator, CompanyAddressValidator } from "../inputs";
import { updateFormField } from "../../utils/reducers";

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const Step3 = ({
  context,
  handleStepSubmission,
  formState,
  formDispatch,
  enableSubmit,
  currentStep,
  handlePreviousStep
}) => {

    const [validating, setValidating] = useState(false);
    const [loadingButtonIcon, setLoadingButtonIcon] = useState('success');
    const [error, setError] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);
    const [validatedObjects, setValidatedObjects] = useState({});

    const handleStepSubmitOnValid = async () => {
        setValidating(true);
        let associatedObjectsDetails = context.crm?.associatedObjects;
        let associatedObjectsPropertyNamesExist = Object.values(associatedObjectsDetails).every((associatedObjectDetails) => associatedObjectDetails.propertyNameList && associatedObjectDetails.propertyNameList.length > 0);
        if(!associatedObjectsPropertyNamesExist) {
            setValidationMessages(["An error occured while submitting, please contact an internal HS administrator to fix this."]);
            setError(true);
            setLoadingButtonIcon('remove');
            setValidating(false);
            return;
        }
        const serverlessFunction = await context.runServerless({ name: "validateAssociatedObjectProperties", parameters: { propertyNameByAssociatedObjects: associatedObjectsDetails } });
        if(serverlessFunction.status !== "SUCCESS") {
            setLoadingButtonIcon('remove');
            setValidating(false);
            setValidationMessages([serverlessFunction.response.message]);
            setError(true);
            return;
        }
        if(serverlessFunction.response?.success === false) {
            if(serverlessFunction.response?.type === "invalid-properties") {
                let invalidProperties = serverlessFunction.response.invalidProperties;
                let invalidPropertiesMessage = [];
                for(let [associatedObjectName, invalidPropertyList] of Object.entries(invalidProperties)) {
                    invalidPropertiesMessage.push(`The following properties are missing for ${associatedObjectName}: ${invalidPropertyList.join(", ")}`);
                }
                setValidationMessages(invalidPropertiesMessage);
                setError(true);
            } else {
                setValidating(false);
                setValidationMessages([serverlessFunction.response.message]);
                setError(true);
            }
            setLoadingButtonIcon('remove');
            setValidating(false);
            return;
        }
        let propertiesByAssociatedObjects = serverlessFunction.response.propertiesByAssociatedObjects;
        for(const associatedObject of Object.values(propertiesByAssociatedObjects)) {
            console.log("associatedObject", associatedObject); 
            
        };
        let validatedObjectsCopy = validatedObjects;
        for(const [associatedObjectName, associatedObject] of Object.entries(propertiesByAssociatedObjects)) {
            validatedObjectsCopy[associatedObjectName] = associatedObject;
        }
        setValidatedObjects(validatedObjectsCopy);
        setValidating(false);
        setValidationMessages([]);
        setError(false);
        setLoadingButtonIcon('success');
        handleStepSubmission();
    };

    useEffect(() => {
        for(const propertyByValidatedObject of Object.values(validatedObjects)) {
            updateFormField(formDispatch, currentStep, propertyByValidatedObject.fieldName, true, propertyByValidatedObject.objectId);
        }
    }, [validatedObjects]);

    return (
        <>
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
                        fieldName={'companyAddress'}
                        currentStep={currentStep}
                        state={formState}
                        dispatch={formDispatch}
                    />
                </Box>
                {error && validationMessages.length > 0 && (
                    <>
                        {validationMessages.map((validationMessage, index) => (
                            <>
                                <Box>
                                    <Alert variant="error" key={index} >{validationMessage}</Alert>
                                </Box>
                            </>
                        ))}
                    </>
                )}
                <Box alignSelf="center">
                    {(currentStep > 0) && (
                        <Button variant="secondary" onClick={handlePreviousStep}>Previous Step</Button>
                    )}
                    <LoadingButton variant="primary" resultIconName={loadingButtonIcon} loading={validating} onClick={handleStepSubmitOnValid} disabled={!enableSubmit}>Submit & Continue</LoadingButton>
                </Box>
            </Flex>
        </>
    );
};
