import * as React from "react"
import { Override, Data } from "framer"
import * as nanogist from "nanogist"
import { GistClient } from "./GistClient"
import { default as Authenticator } from "netlify-auth-providers"

// @ts-ignore
import { data as MOCK_DATA } from "./MockData.json"

const EXAMPLE_TOKEN = "eaa8fbe4e81f5f2193afbeb43a3943ff17ac2d68"

let gistClient
let authToken

// state

const appState = Data({
    gist: null,
    gists: MOCK_DATA,
    currentPage: 0,
    pageTitle: "Posts",
    backAction: null as any,
})

// Events

const authenticate = async () => {
    if (navigator.userAgent.includes("FramerX")) {
        authToken = EXAMPLE_TOKEN
        gistClient = GistClient(authToken)
        const gists = MOCK_DATA
        loadGists(gists)
    } else {
        const authenticator = new Authenticator({}).authenticate(
            { provider: "github", scope: "user" },
            async (err, data) => {
                authToken = data.token
                gistClient = GistClient(authToken)
                const gists = await gistClient.all()
                loadGists(gists)
            }
        )
    }
}

const loadGists = async data => {
    appState.gists = data
    appState.currentPage = 1

    if (data[0]) {
        appState.pageTitle = "Gists for " + data[0].owner.login
    }
}

const loadGist = async gist => {
    const data = await gistClient.get(gist.id)

    appState.gist = data
    appState.currentPage = 2
    appState.pageTitle = "Gist for " + data.owner.login
    appState.backAction = () => {
        appState.pageTitle = "Gists for " + data.owner.login
        appState.currentPage = 1
    }
}

// authenticate

export const Button: Override = () => {
    return {
        onTap: authenticate,
    }
}

// Overrides

export function UsingExampleFlag(): Override {
    return {
        y: navigator.userAgent.includes("FramerX") ? 0 : 1000,
    }
}

// Top navigation for current tab / back
export function Header(): Override {
    return {
        title: appState.pageTitle,
        leftLink: appState.backAction ? "Back" : "",
        leftIcon: appState.backAction ? "chevron-left" : "none",
        onLeftTap: () => appState.backAction && appState.backAction(),
    }
}

export function NavigationPage(): Override {
    return {
        currentPage: appState.currentPage,
    }
}

export const Gists: Override = () => {
    return {
        items: appState.gists.map(gist => {
            return {
                text: gist.files[Object.keys(gist.files)[0]].filename,
                message:
                    gist.description && gist.description.length > 24
                        ? gist.description.slice(0, 24) + "..."
                        : gist.description,
                component: "icon",
                onTap: () => loadGist(gist),
            }
        }),
    }
}

export const GistTitle: Override = () => {
    const { gist } = appState

    if (!gist) {
        return {}
    }

    return {
        text: gist.description,
    }
}

export const GistDate: Override = () => {
    const { gist } = appState

    if (!gist) {
        return {}
    }

    const createdDate = new Date(gist.created_at).toLocaleDateString(
        "en-gb",
        {}
    )
    const updatedDate = new Date(gist.updated_at).toLocaleDateString(
        "en-gb",
        {}
    )

    return {
        text: "Created: " + createdDate + " | Updated: " + updatedDate,
    }
}

export const GistFiles: Override = () => {
    const { gist } = appState
    if (!gist) {
        return {}
    }

    const files = Object.keys(gist.files).map(key => gist.files[key])

    return {
        cards: files.map(file => ({
            title: file.filename,
            body: "` " + file.content + " `",
            height: 480,
        })),
    }
}
