export const modalities: { [code: string]: { displayName: string }} = {
    'acup': {
        displayName: "Acupuncture"
    },
    'bota': {
        displayName: "Botanical Medicine"
    },
    'chin': {
        displayName: "Chinese Medicine"
    },
    'diag': {
        displayName: "Diagnostic"
    },
    'home': {
        displayName: "Homeopathy"
    },
    'inte': {
        displayName: "WHO TF KNOWS"
    },
    'nutr': {
        displayName: "Nutrition"
    },
    'phys': {
        displayName: "Physical Medicine"
    },
    'psyc': {
        displayName: "Psychology (?)"
    },
    'vibr': {
        displayName: "Vibrators? Who tf knows"
    },
}

export const getModality = (codeOrDisplayName: string) => {
    const lower = codeOrDisplayName.toLowerCase()

    if (lower in modalities) {
        return modalities[lower];
    }
}