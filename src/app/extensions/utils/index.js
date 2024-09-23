import { useEffect } from 'react';


export const loadExtensionSettings = (context, setLoadingSettings) => {
    context.extension = { ...context.extension, ...attachExtensionContext(context) };
    useEffect(() => {
        async function attachDealProperties() {
            context.crm.objectProperties = await context.actions.fetchCrmObjectProperties('*');
            context.crm.objectPipelineSettings = getObjectPipelineSettings(context);
            setLoadingSettings(false);
        };
        attachDealProperties();
    }, []);
}

const getObjectPipelineSettings = (context) => {
    let pipelineId = context.crm.objectProperties.pipeline;
    let salesSettings = Object.values(context.extension.sales).find((salesTeamBrandSegment) => salesTeamBrandSegment.closingPipelineId === pipelineId);
    return salesSettings;
}

export const attachExtensionContext = (context) => {
    let portalId = context.portal.id;
    switch(portalId) {
        case 9145732:
            return {
                sales: {
                    ers: { 
                        label: "ERS",
                        teamId: "47385455",
                        closingPipelineId: '2775952',
                        closingDealStageId: '151949679',
                        onboardingLink: "https://www.eventrentalsystems.com/onboarding"
                    },
                    drs: { 
                        label: "DRS",
                        teamId: "47385466",
                        closingPipelineId: 'default',
                        closingDealStageId: '151941676',
                        onboardingLink: "https://www.dumpsterrentalsystems.com/onboarding"
                    }
                }
            };
        case 47116658:
            return {
                sales: {
                    ers: { 
                        label: "ERS",
                        teamId: "49960194",
                        closingPipelineId: 'default',
                        closingDealStageId: 'closedwon',
                        onboardingLink: "https://www.eventrentalsystems.com/onboarding"
                    },
                    drs: { 
                        label: "DRS",
                        teamId: "49960165",
                        closingPipelineId: 'default',
                        closingDealStageId: 'closedwon',
                        onboardingLink: "https://www.dumpsterrentalsystems.com/onboarding"
                    }
                }
            };
        default:
            return {}
    }
}