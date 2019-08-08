interface ILoadOptions {
    name: string,
    id: string
}

function empty(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
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

function displayResult() {
    loadTheThing({
        name: "monographs",
        id: "aebf1dc868df66dca116854023442fb4"
    })
        .then(parseAndSanitizeTheThing)
        .then(mountTheThing)
        .catch(console.error)
}

window.onload = displayResult;
