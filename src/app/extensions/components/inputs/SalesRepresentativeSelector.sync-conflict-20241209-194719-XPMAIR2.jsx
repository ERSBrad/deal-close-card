import React, { useState, useEffect } from "react";
import {
  Select,
  Tile
} from "@hubspot/ui-extensions";
import { updateFormField } from "../../utils/reducers";
import { handleErrors } from "../../utils";

export const SalesRepresentativeSelector = ({ context, fieldName, runServerless, fetchProperties, currentStep, state, dispatch}) => {

    const [salesRepresentatives, setSalesRepresentatives] = useState([]);
    const [currentSalesRepresentative, setCurrentSalesRepresentative] = useState(state[currentStep]?.[fieldName]?.value || {
        value: "",
        label: "",
        properties: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [valid, setValid] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, valid, currentSalesRepresentative);
    
    useEffect(() => {
        async function determineSalesRepresentative() {
            let teams = context.extension.sales;
            let teamIds = [];
            Object.keys(teams).forEach((team) => teamIds.push(teams[team].teamId));
            const serverlessFunction = await runServerless({
                name: "fetchOwnersByTeam", parameters: { teamIds: teamIds }
            });
            handleErrors(serverlessFunction, context, setError, setValidationMessage);
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
            if(currentSalesRepresentative.value === "") {
                setCurrentSalesRepresentative(suggestedSalesRepresentative);
            }
            setValid(true);
            setLoading(false);
        }
        determineSalesRepresentative();

    }, []);

    const handleSalesRepresentativeChange = (value) => {
        let selectedSalesRepresentative = salesRepresentatives.find(salesRep => salesRep.value === value);
        setCurrentSalesRepresentative(selectedSalesRepresentative);
    }

    let placeholderText = loading ? "Loading..." : "Select a Sales Representative";

    return (
        <Tile compact>
            <Select
                name="salesRepresentative"
                label="Choose a Sales Representative"
                tooltip="The sales representative that will get credit for this deal."
                value={currentSalesRepresentative.value}
                options={salesRepresentatives}
                placeholder={placeholderText}
                onChange={handleSalesRepresentativeChange}
                required={true}
                readOnly={loading || error}
                error={error}
                validationMessage={validationMessage}
                //Doesn't necessarilly need an error because this should always have a value, contact and company don't
            />
        </Tile>
    );

}