import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  Tile
} from "@hubspot/ui-extensions";
import { setFieldValidity, setRequiredFieldName } from "../../utils";

export const SalesRepresentativeSelector = ({ appJson, fieldNameGenerator, setValidity, context, runServerless, fetchProperties}) => {

    const [salesRepresentatives, setSalesRepresentatives] = useState([]);
    const [currentSalesRepresentative, setCurrentSalesRepresentative] = useState({
        value: "",
        label: "",
        properties: {}
    });
    const [showError, setShowError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [isValid, setIsValid] = useState(false);
    const fieldName = setRequiredFieldName(fieldNameGenerator);
    setFieldValidity(fieldName, setValidity, isValid);
    
    useEffect(() => {
        
        async function determineSalesRepresentative() {
            let teams = appJson.settings.teams.sales;
            let teamIds = [];
            Object.keys(teams).forEach((team) => teamIds.push(teams[team].id));
            const serverlessFunction = await runServerless({
                name: "fetchOwnersByTeam", parameters: { teamIds: teamIds }
            });
            if(serverlessFunction.status !== 'SUCCESS') {
                setShowError(true);
                setValidationMessage(serverlessFunction.message || "An error occurred, reload the page to try again");
                throw new Error(serverlessFunction.message);
            }
            //Grouped it by TeamID in case we want to split it by brand segment at some point
            let salesRepresentativesByTeamIds = serverlessFunction.response;
            if(salesRepresentativesByTeamIds.length == 0) return;
            const currentDealProperties = await fetchProperties(['hubspot_owner_id']);
            let currentUser = context.user.id;
            let currentDealOwner = currentDealProperties.hubspot_owner_id;
            let teamGroups = Object.entries(salesRepresentativesByTeamIds);
            let allSalesRepresentativesInTeams = [];
            let suggestedSalesRepresentative = {};
            let currentUserInSalesTeam = false;
            for(const [ teamId, salesRepresentatives ] of teamGroups) {
                for(const salesRepresentative of salesRepresentatives) {
                    allSalesRepresentativesInTeams.push(salesRepresentative);
                    let salesRepresentativeUserId = salesRepresentative.properties.userId;
                    let salesRepresentativeOwnerId = salesRepresentative.properties.id;
                    if(currentUser == salesRepresentativeUserId) {
                        suggestedSalesRepresentative = salesRepresentative;
                        currentUserInSalesTeam = true;
                        //Not breaking because I need the full loop to build salesRep list
                    }
                    if(!currentUserInSalesTeam && currentDealOwner == salesRepresentativeOwnerId) {
                        suggestedSalesRepresentative = salesRepresentative;
                    }
                }
            }
            setSalesRepresentatives(allSalesRepresentativesInTeams);
            setCurrentSalesRepresentative(suggestedSalesRepresentative);
            setIsValid(true);
        }
        determineSalesRepresentative();

    }, []);

    return (
        <Tile compact>
            <Select
                name="salesRepresentative"
                label="Choose a Sales Representative"
                tooltip="The sales representative that will get credit for this deal."
                value={currentSalesRepresentative.value}
                options={salesRepresentatives}
                onChange={(value) => setCurrentSalesRepresentative(value)}
                required={true}
                error={showError}
                validationMessage={validationMessage}
                //Doesn't necessarilly need an error because this should always have a value, contact and company don't
            />
        </Tile>
    );

}