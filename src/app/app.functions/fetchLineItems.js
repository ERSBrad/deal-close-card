const axios = require('axios');

exports.main = async (context = {}) => {
  let id = context.parameters.currentObjectId;
  const token = process.env['PRIVATE_APP_ACCESS_TOKEN'];

  //This should also be grabbing the current deals line items and returning them if they exist. Need to evaluate the complexity it would add to the code; like modifying an existing line item.
  const requestBody = {
    operationName: 'GetDealLineItems',
    query: `
      query GetDealLineItems ($id: String!) {
        CRM {
          deal(uniqueIdentifier: "id", uniqueIdentifierValue: $id) {
            hs_num_of_associated_line_items
            associations {
              line_item_collection__primary {
                items {
                  hs_object_id
                  hs_sku
                  price
                  name
                  hs_product_id
                  recurringbillingfrequency
                  isplantype
                }
              }
            }
          }
          product_collection(filter: {hs_sku__not_null: "TRUE"}, limit:100 ) {
            items {
              hs_sku
              name
              price
              recurringbillingfrequency
              hs_object_id
              isplantype
            }
          }
        }
      }
    `,
    variables: {id}
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

    const products = responseBody.data.CRM.product_collection.items.map(item => { 
      return {
        label: item.name,
        value: item.hs_sku,
        price: item.price,
        frequency: item.recurringbillingfrequency ? item.recurringbillingfrequency.label : 'One Time',
        isPlanType: item.isplantype,
        productId: item.hs_object_id,
        existingLineItem: false,
      };
    });

    const dealLineItems = {
      numItems: responseBody.data.CRM.deal.hs_num_of_associated_line_items,
      items: responseBody.data.CRM.deal.associations.line_item_collection__primary.items.map(item => {
        const lineItemsProductId = item.hs_product_id;
        let lineItemsPlanType = item.isplantype;
        if(!lineItemsPlanType) {
          const lineItemsProduct = products.find(product => product.productId === lineItemsProductId);
          lineItemsPlanType = lineItemsProduct && lineItemsProduct.isPlanType;
        }
        return {
          label: item.name,
          value: item.hs_sku,
          price: item.price,
          frequency: item.recurringbillingfrequency ? item.recurringbillingfrequency.label : 'One Time',
          isPlanType: lineItemsPlanType,
          productId: lineItemsProductId,
          id: item.hs_object_id
        };
      }),
    };

    return { products, dealLineItems };
  } catch (error) {
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
};
