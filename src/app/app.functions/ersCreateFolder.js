let axios = require('axios');
let qs = require('querystring');


exports.main = async (context = {}) => {

  let { formState: formData, dealProperties } = context.parameters;

  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'object' && !Array.isArray(formData[key]) && formData[key] !== null) {
      Object.assign(formData, formData[key]);
      delete formData[key];
    }
  });

  //const createErsFolderResponseData = await createErsFolder(formData);
  const upsertLineItemsResponseData = await upsertHubSpotLineItems(formData, dealProperties);

  return createErsFolderResponseData;
  
};

const upsertHubSpotLineItems = async (formData, dealProperties) => {
  let lineItems = formData.lineItems?.value;
  if(!lineItems || lineItems.length === 0) throw new Error("No line items found.");
  let batchInputObjectForCreate = [];
  lineItems.forEach(lineItem => {
    console.log("lineItems", lineItems);
    console.log("lineItem", lineItem);
    //let productId = lineItem.productId || null;
  });
    //await hubspot.crm.lineItems.basicApi.update(lineItemId, lineItemProperties);
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
    qs.stringify(postData), 
    {
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