/**
 * TODO: I need a mechanism to map and convert hubspot id's into NetSuite id's, for contacts, companies, lineItems, and salesRepresentative.
 */
const workatoNetSuiteData = {
    contact: formData["contactAddress"].value,
    company: formData["companyAddress"].value,
    lineItems: formData["lineItems"].value,
    foldername: formData["foldername"].value,
    salesRepresentative: formData["salesRepresentative"].value.properties.id,
}