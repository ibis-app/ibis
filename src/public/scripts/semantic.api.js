import { apiHostname } from '../../api/config'

$.api.settings.verbose = true

$.api.settings.api = {
    'search treatments': `${apiHostname}/data/treatments?q={query}`,
    'search diseases': `${apiHostname}/data/diseases?q={query}`,
    'search': `${apiHostname}/data?q={query}`
}