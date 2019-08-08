import "/node_modules/pouchdb/dist/pouchdb"
import { empty } from "./utils"

interface ILoadOptions {
    name: string,
    id: string
}

/**
 * Loads the document from the pouch db.
 */
async function loadTheThing(options: ILoadOptions) {
    console.debug("new db")
    const mydb = new PouchDB(`http://localhost:5984/${options.name}`)

    console.debug("get attachment")
    const attachment = await mydb.getAttachment(options.id, "content")
    console.debug("got attachment")

    return attachment as Blob;
}

/**
 * Parses the html and makes sure it's gucci.
 */
function parseAndSanitizeTheThing(attachment: Blob): Promise<DocumentFragment> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = () => {
            console.log(fileReader.result)

            if (fileReader.readyState === FileReader.DONE) {
                console.log("ding!")
                const fragment = document.createDocumentFragment()
                const parser = new DOMParser()
                try {
                    const parsed = parser.parseFromString(fileReader.result as string, "text/html")

                    fragment.appendChild(parsed.body)
                    resolve(fragment)
                } catch (e) {
                    reject(e)
                }
            }
        }

        fileReader.onerror = reject

        fileReader.readAsText(attachment)
    });
}

/**
 * Mounts any relevant data on the DOM.
 */
async function mountTheThing(fragment: DocumentFragment) {
    const frame = document.getElementById("frame");

    empty(frame)

    frame.appendChild(fragment);
}

async function removeLoadingIndicator() {
    const progressIndicator = document.getElementById("frame-loading")

    progressIndicator.parentNode.removeChild(progressIndicator)
}

function displayResult() {
    if (!window.location.search || window.location.search === "") {
        return
    }

    const urlSearchParams = new URLSearchParams(window.location.search.slice(1))

    loadTheThing({
        name: urlSearchParams.get("category"),
        id: urlSearchParams.get("id")
    })
        .then(parseAndSanitizeTheThing)
        .then(mountTheThing)
        .catch(console.error)
        .finally(removeLoadingIndicator)
}

window.onload = displayResult;
