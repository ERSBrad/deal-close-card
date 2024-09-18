const axios = require('axios');
const qs = require('querystring');
const hubspot = require('@hubspot/api-client');
const path = require('path');

exports.main = async (context = {}) => {
  
  let { formState: formData, dealProperties, clientContext } = context.parameters;

  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'object' && !Array.isArray(formData[key]) && formData[key] !== null) {
      Object.assign(formData, formData[key]);
      delete formData[key];
    }
  });

  hubspotClient = new hubspot.Client({ accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN'] });

  try {
    const upsertLineItemsResponseData = await upsertHubSpotLineItems(hubspotClient, formData, dealProperties);
    const upsertHubSpotPropertiesResponse = await upsertHubSpotProperties(hubspotClient, formData, dealProperties, clientContext);
    const createErsFolderResponseData = await createErsFolder(formData);
  } catch(error) {
    console.error(error);
    throw new Error(error.message);
  }
  return { message: "Folder created and properties upserted successfully." };
  
};

const upsertHubSpotLineItems = async (hubspotClient, formData, dealProperties) => {

  let lineItems = formData.lineItems?.value;
  if(!lineItems || lineItems.length === 0) throw new Error("No line items found.");
  let batchInputObjectForDeleteInputs = [];
  let batchInputObjectForUpdateInputs = [];
  let batchInputObjectForInsertInputs = [];
  let deaLineItemAssociations = [{
    "types": [{
        "associationCategory": "HUBSPOT_DEFINED",
        "associationTypeId": 20
    }],
    "to": {
        "id": "21569957652"
    }
  }];

  lineItems.forEach(lineItem => {

    if(lineItem.id) {
      /**
       * Add here, if line item in cleared list, then:
       * batchInputObjectForDeleteInputs.push({ id: lineItem.id, ... });
       */
      batchInputObjectForUpdateInputs.push({
        id: lineItem.id,
        associations: deaLineItemAssociations,
        properties: {
          hs_product_id: lineItem.productId,
          price: lineItem.price
        }
      });

    } else {

      batchInputObjectForInsertInputs.push({
        associations: deaLineItemAssociations,
        properties: {
          hs_product_id: lineItem.productId,
          price: lineItem.price,
          quantity: 1
        }
      });

    }
  });

  const batchInputObjectForUpdate = {
    inputs: batchInputObjectForUpdateInputs
  }

  const batchInputObjectForInsert = {
    inputs: batchInputObjectForInsertInputs
  }

  try {
    
    const responseUpdate = await hubspotClient.crm.lineItems.batchApi.update(batchInputObjectForUpdate);
    const responseInsert = await hubspotClient.apiRequest({
      method: 'POST',
      path: '/crm/v3/objects/line_items/batch/create',
      body: batchInputObjectForInsert
    });

    console.info("Line items upserted successfully.");

  } catch (error) {

    console.error(error);
    throw new Error("An error occurred while upserting line items. Please try again later.");
    
  }

};

const upsertHubSpotProperties = async (hubspotClient, formData, dealProperties, clientContext) => {
  
  let properties = {
    "dealstage": "closedwon",
    "folder_name": formData.foldername?.value || null,
    "sales_representative": formData.salesRepresentative?.value?.properties?.id || null,
    "hubspot_owner_id": formData.salesRepresentative?.value?.properties?.id || null,
  };
  const simplePublicObjectInput = {
    properties: properties
  };
  try {
    let response = await hubspotClient.crm.deals.basicApi.update(clientContext.crm.objectId, simplePublicObjectInput);
    console.info("HubSpot properties upserted successfully.");
  } catch(error) {
    console.error(`${error.body.message} Code: ${error.code} Type ${error.body.category}`);
    throw new Error(error.body.message);
  }
 
}; 

const createErsFolder = async (formData) => {

  const foldername = formData.foldername?.value || null;
  const companyName = formData.billingCompany?.value?.properties?.name || null;
  /**
   * Per Wesley's request, we are sending foldername 
   * in lieu of the actual contactId for the value
   * const contactId = formState.billingContact.value;
   */
  const contactId = formData.foldername?.value || null;
  const default_folder = formData.websiteTemplate?.value?.sandbox___website_template || null;
  let planTypeLineItem = formData.lineItems?.value.find((lineItem) => lineItem.isPlanType === true);
  if(!planTypeLineItem || planTypeLineItem.length === 0) {
    throw new Error("No plan type line item was found. The endpoint to create folders requires a plan type line item. Contact an administrator if you feel this is a mistake.");
  }
  const productId = planTypeLineItem.productId || null;
  const postData = {
    "foldername": `${foldername}`,
    "company_name": `${companyName}`,
    "contact_id": `${contactId}`,
    "default_folder": `${default_folder}`,
    "product_id": `${productId}`,
  };
  
  let missingPostData = Object.values(postData).some(value => value === null);
  if(missingPostData) {
    throw new Error("One or more required fields are missing. Please check your input and try again. If the problem persists, contact an administrator.", postData);
  }
  const response = await axios.post(`https://manage.ourers.com/api/create_folder/`, 
      qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': process.env['ERS_API_KEY']
      }
  });

  let data = response.data;
  if(!data.success) {
    throw new Error(data.message);
  }
  return data;

};