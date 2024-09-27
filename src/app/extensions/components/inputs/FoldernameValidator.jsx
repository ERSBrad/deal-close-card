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
    const [error, setError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [valid, setValid] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, valid, foldername);


    const checkFoldername = async () => {
        if(foldername && foldername.length > 0 && typeof foldername === "string") {
            const validFoldername = /^[a-z0-9-_]+$/.test(foldername);
            if(!validFoldername) {
                setValidationMessage("Foldername can only contain lowercase letters, numbers, hyphens, and underscores.");
                setError(true);
                return;
            }
            const serverlessFunction = await runServerless({ name: "ersCheckFoldername", parameters: { foldername } });
            if(!serverlessFunction.status == "SUCCESS") {
                setError(true);
                setValidationMessage("An unknown error occurred checking foldername, please try again.");
                return;
            }
            let ersResponse = serverlessFunction.response;
            const { success, message } = ersResponse;
            if(!success) {
                setError(true);
                setValidationMessage(message);
                return;
            }
            setError(false);
            setValid(true);
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
                        error={error}
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