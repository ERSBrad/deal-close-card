const hubspot = require('@hubspot/api-client');
const { default: axios } = require('axios');

exports.main = async (context = {}) => {
    let id = context.parameters.currentObjectId;
    let companies = await fetchAssociations(id);
    return companies.map(company => ({
        label: company.name,
        value: company.hs_object_id,
        properties: {
            name: company.name,
            domain: company.domain,
            id: company.hs_object_id,
            folder_name: company.folder_name
        }
    }));
}

const fetchAssociations = async (id) => {
    let associatedObjects = [];
    gql.headers.Authorization = `Bearer ${process.env["PRIVATE_APP_ACCESS_TOKEN"]}`;
    try {
        let response = await axios.post(gql.endpoint, JSON.stringify({
            operationName: 'data',
            query: gql.query,
            variables: { id }
        }), { headers: gql.headers });
        let responseBody = response.data;
        associatedObjects = responseBody?.data?.CRM?.deal?.associations?.company_collection__deal_to_company_unlabeled?.items || [];
    } catch (error) {
        if (error.response) {
            console.error('fetchAssociations error response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('fetchAssociations error message:', error.message);
        }
        throw error;
    }
    return associatedObjects;
}

const gql = {
    endpoint: 'https://api.hubapi.com/collector/graphql',
    headers: {
        'Content-Type': 'application/json',
    },
    query: `
        query data ($id: String!) {
            CRM {
                deal(uniqueIdentifier: "id", uniqueIdentifierValue: $id) {
                    associations {
                        company_collection__deal_to_company_unlabeled {
                            total
                            items {
                                name
                                hs_object_id
                                domain
                                folder_name
                            }
                        }
                    }
                }
            }
        }
    `
};