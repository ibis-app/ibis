import './reload'
import './semantic.api'
import { Directory } from '../../api/db'

declare var $: JQueryStatic

$(document).ready(() => {
    $('#modality-menu-toggle').click(() => {
        let menu: any = $('#modality-menu') as any;
        if (menu) {
            menu.sidebar('toggle')
        }
    });

    ($('.ui.button.htm-link') as any).api({
        encodeParameters: false,
        onSuccess: (data: any) => {
            console.dir(data)
        }
    });

    ($('.ui.search') as any).search({
        apiSettings: {
            onResponse: (data: { directory: string, results: { item: Directory, matches: any[]}[] }): { results: { title: string, url: string }[]} => {
                if (!data.results) {
                    return ({
                        results: []
                    })
                }
                return ({
                    results: data.results.map(result => ({ 
                        title: result.item.header.name,
                        url: result.item.filename
                    }))
                })
            }
        }
    })
})