import axios from 'axios'

function interceptClickEvent(e: MouseEvent): any {
    var t = e.target as HTMLAnchorElement

    if (!t) {
        return true
    }

    const {
        href,
        hostname,
        port
    } = t;

    const {
        hostname: currentHostname,
        port: currentPort
    } = window.location

    if (port === currentPort && hostname === currentHostname) {
        console.log('its local')
        // e.preventDefault()
        axios({
            method: 'GET',
            url: href
        }).then(({ data }) => {
            console.dir(data)
        })
    }
}


//listen for link click events at the document level
if (document.addEventListener) {
    document.addEventListener('click', interceptClickEvent)
}