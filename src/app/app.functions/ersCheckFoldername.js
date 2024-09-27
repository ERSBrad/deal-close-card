let axios = require('axios');
const hubspot = require('@hubspot/api-client');


exports.main = async (context = {}) => {
  let { foldername } = context.parameters;
  let response = await axios.get(`https://manage.ourers.com/api/folders/validate/?foldername=${foldername}`, {
    headers: {
      'X-API-Key': process.env['ERS_API_KEY']
    }
  });
  let data = response.data;
  return data;
};