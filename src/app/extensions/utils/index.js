export const flattenFormState = (formState) => {
    let formData = { ...formState };
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && !Array.isArray(formData[key]) && formData[key] !== null) {
        Object.assign(formData, formData[key]);
        delete formData[key];
        }
    });
    return formData;
}

export const handleErrors = (serverlessFunction, context, setError, setValidationMessage, reloadDelay=1000) => {
    if(serverlessFunction.status === "ERROR") {
        const timeoutRegex = /Task timed out after (.*) seconds/i;
        if(serverlessFunction.message.match(timeoutRegex)) {
            console.log(context);
            if(!context.extension.reloadInitiated) {
                context.extension.reloadInitiated = true;
                context.actions.addAlert({ type: "danger", message: "The HubSpot API timed out, reloading the page automatically. Close this tab to stop automatic reloads." });
                setTimeout(() => {
                    context.actions.reloadPage();
                }, reloadDelay);
                throw new Error(serverlessFunction.message);
            }
        } else {
            setError(true);
            setValidationMessage("Please reload the page and see if this error resolves. If not, contact internal HS support.");
            console.log(serverlessFunction.message);
        }
    }
}