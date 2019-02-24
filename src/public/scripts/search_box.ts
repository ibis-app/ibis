import { ajax } from 'jquery'
import { apiHostname } from '../../api/config'

export function search(event: Event) {
    console.log('searched')
    event.preventDefault()

    const {
        target
    } = event

    const element = target as HTMLElement

    if (!element) {
        return false
    }

    const text = element.querySelector('.query') as HTMLInputElement

    console.log(text.value)

    ajax({
        url: `${apiHostname}/data`,
        data: {
            q: text.value
        }
    }).then(response => {
        console.log(response)
    })

    return true
}