import { getDirectoryIdentifier } from "./db"
import test from "ava"

test("search:formatSearchDirectory:based off id", (t) => {
    t.is("/treatments/acup/entryID", getDirectoryIdentifier({
        id: "entryID",
        modality: {
            code: "acup",
            data: {
                "displayName": ""
            }
        },
        category: "treatments",
    }))
})
