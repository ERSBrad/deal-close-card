import React, { useState, useEffect } from "react";
import {
  Select,
  Tile
} from "@hubspot/ui-extensions";
import appJson from "../../app.json";

export const SalesRepresentativeSelector = ({ context, runServerless, fetchProperties }) => {

    const [salesRepresentative, setSalesRepresentative] = useState([]);
    const [currentSalesRepresentative, setCurrentSalesRepresentative] = useState({
        value: "",
        label: "",
        properties: {}
    });

    useEffect(() => {
        async function determineSalesRepresentative() {
            let teams = appJson.settings.teams.sales;
            let teamIds = [];
            Object.keys(teams).forEach((team) => teamIds.push(teams[team].id));
            const serverlessFunction = await runServerless({
                name: "fetchOwnersByTeam", parameters: { teamIds: teamIds }
            });
            if(serverlessFunction.status !== 'SUCCESS') throw new Error(serverlessFunction.message);
            //Grouped it by TeamID in case we want to split it by brand segment at some point
            let salesRepresentativesByTeamIds = serverlessFunction.response;
            if(salesRepresentativesByTeamIds.length == 0) return;
            const currentDealProperties = await fetchProperties(['hubspot_owner_id']);
            let currentUser = context.user.id;
            let currentDealOwner = currentDealProperties.hubspot_owner_id;
            let teamGroups = Object.entries(salesRepresentativesByTeamIds);
            for(const [teamId, salesRepresentatives] of teamGroups) {
                
            }
        }
        determineSalesRepresentative();
    }, []);

    return (
        <Tile>Coming soon</Tile>
    );

}