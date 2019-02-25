import './reload'
import './semantic.api'
import { Directory } from '../../api/db'
import { FuseResult } from 'fuse.js'
import { Searchable } from 'fomantic-ui'

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

    ($('.ui.search') as Searchable).search({
        apiSettings: {
            onResponse: (data: { directory: string, results: FuseResult<Directory>[]}) => {
                const results = data.results || []
                return ({
                    results: results.map(result => ({ 
                        category: result.item.modality.data.displayName,
                        title: result.item.header.name,
                        url: result.item.url
                    }))
                })
            }
        }
    })
})