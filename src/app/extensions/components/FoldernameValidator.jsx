import React, { useState } from "react";
import {
  Input,
  Tile
} from "@hubspot/ui-extensions";

export const FoldernameValidator = ({ context, runServerless, sendAlert, validInput }) => {

    const [foldername, setFoldername] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [isValid, setIsValid] = useState(true);

    const checkFoldername = async () => {
        if(foldername && foldername.length > 0) {
            let serverlessResponse = await runServerless({ name: "ersCheckFoldername", parameters: { foldername } });
            if(!serverlessResponse.status == "SUCCESS") {
                setIsValid(false);
                setValidationMessage("An unknown error occurred checking foldername, please try again.");
                setSubmitEnabled(false);
                return;
            }
            let ersResponse = serverlessResponse.response;
            let { success, message } = ersResponse;
            if(!success) {
                setIsValid(false);
                setValidationMessage(message);
                setSubmitEnabled(false);
                return;
            }
            setIsValid(true);
            setValidationMessage(message);
        }
    }
    
    return (
        <Tile compact>
            <Input
                name="foldername"
                label="Choose a Folder Name"
                tooltip="The name of the folder you want to create."
                value={foldername}
                placeholder={"Enter a folder name"}
                onChange={(value) => setFoldername(value)}
                onBlur={() => checkFoldername()}
                error={!isValid}
                validationMessage={validationMessage}
                required={true}
            />
        </Tile>
    )

}