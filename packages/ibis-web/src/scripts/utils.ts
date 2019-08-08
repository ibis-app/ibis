export function empty(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

export async function get(url: string) {
    return fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw response
            }
        })
}
