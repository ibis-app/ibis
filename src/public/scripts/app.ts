import './reload'
import './semantic.api'
import { Directory, CategorizedSearchResult, Thing } from '../../api/db'
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
        type: 'category',
        apiSettings: {
            onResponse: (data: CategorizedSearchResult) => {
                const newData =({
                    ...data,
                    results: Object.keys(data.results).reduce((acc: any, category) => {
                        const d = data.results[category]
                        acc[category] = ({
                            ...d,
                            results: d.results.map(result => ({
                                category: result.modality.data.displayName,
                                title: result.header.name,
                                url: result.url
                            }))
                        })
                        return acc
                    }, {})
                })

                console.dir(newData)
                return newData
            }
        }
    })
})