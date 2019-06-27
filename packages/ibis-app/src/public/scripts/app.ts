import "./semantic-api"

import { CategorizedSearchResult } from "@ibis-app/api"

import { SearchDirectory } from "@ibis-app/api/dist/search";
import { Searchable } from "fomantic-ui"

declare var $: JQueryStatic

$(document).ready(() => {
    function annotateSearchDirectory(result: SearchDirectory) {
        return ({
            ...result,
            category: result.modality.data.displayName,
            title: result.header.name
        })
    }

    function annotateSearchResult(data: any) {
        return ({
            ...data,
            results: data.results.map(annotateSearchDirectory)
        })
    }

    $("#modality-menu-toggle").click(() => {
        let menu: any = $("#modality-menu") as any;
        if (menu) {
            menu.sidebar("toggle")
        }
    });

    ($(".ui.button.htm-link") as any).api({
        encodeParameters: false,
        onSuccess: (data: any) => {
            console.dir(data)
        }
    });

    ($(".ui.search") as Searchable).search({
        apiSettings: {
            onResponse: annotateSearchResult
        }
    });

    ($(".ui.search.categorize") as Searchable).search({
        type: "category",
        apiSettings: {
            onResponse: (data: CategorizedSearchResult) => {
                return ({
                    ...data,
                    results: Object.keys(data.results).reduce((acc: any, category) => {
                        const d = data.results[category]
                        acc[category] = annotateSearchResult(d)
                        return acc
                    }, {})
                })
            }
        }
    });
})
