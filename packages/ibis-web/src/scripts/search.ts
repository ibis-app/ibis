import { empty, get } from "./utils"

async function detectQuery() {
    console.log("detecting query")
    if (!window.location.search || window.location.search === "") {
        console.log("no query")
        return
    }

    const urlSearchParams = new URLSearchParams(window.location.search.slice(1))

    return {
        queryString: urlSearchParams.get("query"),
        category: "monographs"
    }
}

interface IQuery {
    queryString?: string,
    category?: string
}

async function dispatchRequest(query: IQuery) {
    console.log(query)

    const searchParams = new URLSearchParams({
        q: query.queryString
    })

    const url = new URL(`http://localhost:3000/data/${query.category}?${searchParams}`)

    return get(url.toString())
}

async function mountResults(data: any) {
    const resultsContainer = document.getElementById("results")

    const resultsList = document.createElement("ol")

    const resultFragment = document.createDocumentFragment()

    resultFragment.appendChild(resultsList)

    data.results.forEach((result: any) => {
        const element = document.createElement("li")

        const viewLink = document.createElement("a")
        viewLink.href = `/view?id=${result._id}&category=${result.category}`
        viewLink.innerText = result.header.name

        element.appendChild(viewLink)

        resultsList.appendChild(element)
    })

    empty(resultsContainer)

    resultsContainer.appendChild(resultFragment)
}

function initialize() {
    console.log("init")
    detectQuery()
        .then(dispatchRequest)
        .then(mountResults)
}

window.onload = initialize
