import { apiHostname } from '../../api/config'

$.api.settings.verbose = true

$.api.settings.api = {
    'get htm': apiHostname + '/{filepath}/info'
}

$('.ui.button').api({
    encodeParameters: false,
    onSuccess: (response) => {
        console.dir(response)
    }
})