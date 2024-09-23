import { useState, useEffect } from "react";
import { 
    Panel,
    PanelBody,
    PanelFooter,
    PanelSection,
    Text, 
    Button
} from "@hubspot/ui-extensions";

export const OnboardingScheduler = ({ context }) => {

    const [valid, setValid] = useState(false);

    return (
        <>
            <Button
            >
            Schedule meeting
            </Button>
        </>
    );

}