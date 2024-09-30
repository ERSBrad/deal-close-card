const hubspot = require('@hubspot/api-client');


exports.main = async (context = {}) => {
    let { propertyNameByAssociatedObjects } = context.parameters;
    let propertiesByAssociatedObjects = propertyNameByAssociatedObjects;
    let invalidProperties = {};
    //Missing objectIds from validator.
    let hubspotClient = new hubspot.Client({ 
        accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN,
        numberOfApiCallRetries: 3
    });
  for(let [associatedObjectName, associatedObjectData] of Object.entries(propertiesByAssociatedObjects)) {
    if(!associatedObjectData || associatedObjectData.length === 0) {
      return { success: false, message: `No associated properties found for ${associatedObjectName}` };
    }
    try {
      console.debug("Properties Serverless:", associatedObjectName, associatedObjectData);
      const pluralizedObjectName = (associatedObjectName === 'contact') ? 'contacts' : (associatedObjectName === 'company') ? 'companies' : associatedObjectName;
      const objectId = associatedObjectData.objectId;
      const propertyNameList = associatedObjectData.propertyNameList;
      let response = await hubspotClient.crm[pluralizedObjectName].basicApi.getById(objectId, propertyNameList);
      propertiesByAssociatedObjects[associatedObjectName].properties = response.properties;
      for(const property in propertyNameList) {
        const propertyName = propertyNameList[property];
        if(!response.properties[propertyName]) {
          invalidProperties[associatedObjectName] = invalidProperties[associatedObjectName] || [];
          invalidProperties[associatedObjectName].push(propertyName);
        }
      }
    } catch(error) {
      error.message === 'HTTP request failed'
      ? console.error(JSON.stringify(error.response, null, 2))
      : console.error(error);
      return { success: false, message: `An error occured while fetching properties for ${associatedObjectName}` };
    }
  }

  if(Object.keys(invalidProperties).length > 0) {
    return { success: false, message: 'Please correct the following properties', type: 'invalid-properties', invalidProperties };
  }
  return { success: true, propertiesByAssociatedObjects };
};