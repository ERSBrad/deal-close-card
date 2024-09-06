let appJson = require("../../app.json");

export const getSalesTeamsIds = () => {
    let salesTeamIds = appJson.settings.teams.sales.map(team => team.id);
    return salesTeamIds;
}