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

export const openOnboardingMeetingIframe = (context, callback) => {
    const scheduleOnboardingLink = context.crm.objectPipelineSettings.onboardingLink;
    const brandSegmentLabel = context.crm.objectPipelineSettings.label;
    context.actions.openIframeModal({
        uri: scheduleOnboardingLink, // this is a relative link. Some links will be blocked since they don't allow iframing
        height: 1000,
        width: 1000,
        title: `Schedule ${brandSegmentLabel} Onboarding`,
        flush: true
    }, callback);
}

export const openPaymentCaptureIframe = (context, callback) => {
    console.log(context);
    const netsuiteInstanceId="5296942_SB2".replace("_", "-");
    const recordId="1030932";
    const paymentCaptureLink = `https://${netsuiteInstanceId}.app.netsuite.com/app/common/entity/custjob.nl?id=${recordId}`;
    //backupid: https://5296942-sb2.app.netsuite.com/app/common/entity/custjob.nl?id=877247
    context.actions.openIframeModal({
        uri: paymentCaptureLink,
        height: 1000,
        width: 1000,
        title: "Capture Payment Token",
        flush: true
    }, callback);
}