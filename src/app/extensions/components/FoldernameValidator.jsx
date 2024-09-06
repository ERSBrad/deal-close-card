import React, { useState, useEffect } from "react";
import {
  Tile,
  Flex,
  Box,
  Input,
  Button,
} from "@hubspot/ui-extensions";

export const FoldernameValidator = ({  id, setValidity, context, runServerless, sendAlert, validInput }) => {

    const [foldername, setFoldername] = useState("");
    const [showError, setShowError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        setValidity(id, isValid);
    }, [isValid]);

    const checkFoldername = async () => {
        if(foldername && foldername.length > 0) {
            let serverlessResponse = await runServerless({ name: "ersCheckFoldername", parameters: { foldername } });
            if(!serverlessResponse.status == "SUCCESS") {
                setShowError(true);
                setValidationMessage("An unknown error occurred checking foldername, please try again.");
                return;
            }
            let ersResponse = serverlessResponse.response;
            let { success, message } = ersResponse;
            if(!success) {
                setShowError(true);
                setValidationMessage(message);
                return;
            }
            setIsValid(true);
            setValidationMessage(message);
        }
    }
    
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