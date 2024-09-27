const hubspot = require("@hubspot/api-client");

exports.main = async (context = {}) => {
    let { teamIds } = context.parameters || [];
    let usersByTeam = await fetchOwnersByTeam(teamIds);
    return usersByTeam;
};

async function fetchOwnersByTeam(teamIds) {
    let usersByTeam = {};
    let hubspotClient = new hubspot.Client({ 
        accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN,
        numberOfApiCallRetries: 3
    });
    try {
        let response = await hubspotClient.crm.owners.ownersApi.getPage();
        let owners = response.results;
        for(const owner of owners) {
            if("teams" in owner) {
                owner.teams.forEach((team) => {
                    let teamIdExists = teamIds.includes(team.id);
                    if(teamIdExists) {
                        usersByTeam[team.id] = usersByTeam[team.id] || [];
                        let ownerJson = ownerToJson(owner);
                        usersByTeam[team.id].push(ownerJson);
                    }
                });
            }
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
    return usersByTeam;
}

function ownerToJson(owner) {
    return {
        value: owner.id,
        label: `${owner.firstName} ${owner.lastName}`,
        properties: {
            id: owner.id,
            userId: owner.userId,
            email: owner.email,
            firstName: owner.firstName,
            lastName: owner.lastName,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        }
    };
}