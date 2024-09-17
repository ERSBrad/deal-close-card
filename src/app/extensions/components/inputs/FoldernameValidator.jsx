import React, { useState, useEffect } from "react";
import {
  Tile,
  Flex,
  Box,
  Input,
  Button,
} from "@hubspot/ui-extensions";
import { updateFormField } from "../../utils/reducers";

export const FoldernameValidator = ({  id, setValidity, fieldName, context, runServerless, sendAlert, validInput, currentStep, state, dispatch }) => {

    const [foldername, setFoldername] = useState(state[currentStep]?.[fieldName]?.value || "");
    const [showError, setShowError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [isValid, setIsValid] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, isValid, foldername);


    const checkFoldername = async () => {
        if(foldername && foldername.length > 0) {
            const serverlessResponse = await runServerless({ name: "ersCheckFoldername", parameters: { foldername } });
            if(!serverlessResponse.status == "SUCCESS") {
                setShowError(true);
                setValidationMessage("An unknown error occurred checking foldername, please try again.");
                return;
            }
            let ersResponse = serverlessResponse.response;
            const { success, message } = ersResponse;
            if(!success) {
                setShowError(true);
                setValidationMessage(message);
                return;
            }
            setShowError(false);
            setIsValid(true);
            setValidationMessage(message);
        }
    }

    useEffect(() => {
        setFoldername(foldername.toLowerCase());
        checkFoldername();
    }, [foldername]);
    
    return (
        <Tile compact>
            <Flex direction="column" gap="xs">
                <Box>
                    <Input
                        name="foldername"
                        label="Choose a Folder Name"
                        tooltip="The name of the folder you want to create."
                        value={foldername}
                        placeholder={"Enter a folder name"}
                        onChange={(value) => setFoldername(value)}
                        onBlur={() => checkFoldername()}
                        error={showError}
                        validationMessage={validationMessage}
                        required={true}
                    />
                </Box>
                <Box alignSelf="end" >
                    <Button 
                    size="small"
                    variant="primary" 
                    onClick={() => checkFoldername()}>
                        Check Availability
                    </Button>
                </Box>
            </Flex>
        </Tile>
    )

}