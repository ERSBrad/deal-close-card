const axios = require('axios');

exports.main = async (context = {}) => {
  const token = process.env['PRIVATE_APP_ACCESS_TOKEN'];

  const requestBody = {
    operationName: 'MyQuery',
    query: `
      query MyQuery {
        CRM {
          product_collection(filter: {hs_sku__not_null: "TRUE"}, limit:100 ) {
            items {
              hs_sku
              name
              price
              recurringbillingfrequency
              hs_object_id 
            }
          }
        }
      }
    `,
    variables: {}
  };

  try {
    const response = await axios.post('https://api.hubapi.com/collector/graphql', JSON.stringify(requestBody), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const responseBody = response.data;

    if (!responseBody.data || !responseBody.data.CRM || !responseBody.data.CRM.product_collection || !responseBody.data.CRM.product_collection.items) {
      throw new Error('Invalid response structure');
    }

    const lineItems = responseBody.data.CRM.product_collection.items.map(item => ({
      label: item.name,
      value: item.hs_sku,
      price: item.price,
      frequency: item.recurringbillingfrequency ? item.recurringbillingfrequency.label : 'One Time',
      productId: item.hs_object_id,
    }));


    return { lineItems };
  } catch (error) {
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
};
