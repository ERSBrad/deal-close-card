const hubspot = require('@hubspot/api-client');
const { default: axios } = require('axios');

exports.main = async (context = {}) => {
    let id = context.parameters.currentObjectId;
    let contacts = await fetchAssociations(id);
    return contacts.map(contactProperties => ({
        label: `${contactProperties.firstname} ${contactProperties.lastname}`,
        value: contactProperties.hs_object_id,
        properties: contactProperties
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
        //console.debug('API Response Body:', JSON.stringify(responseBody, null, 2));
        associatedObjects = responseBody?.data?.CRM?.deal?.associations?.contact_collection__deal_to_contact?.items || [];
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
                        contact_collection__deal_to_contact {
                            total
                            items {
                                hs_object_id
                                firstname
                                lastname
                                email
                                phone
                                company
                                address
                                city
                                state
                                zip
                                country
                            }
                        }
                    }
                }
            }
        }
`
};