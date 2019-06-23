import * as React from "react"
import { Override } from "framer"

import { default as Authenticator } from "netlify-auth-providers"

const authenticator = new Authenticator({})

export const Button: Override = () => {
    const authenticate = () => {
        authenticator.authenticate(
            { provider: "github", scope: "user" },
            function(err, data) {
                if (err) {
                    console.log("error")
                } else {
                    console.log(
                        "Authenticated with GitHub. Access Token: " + data.token
                    )
                }
            }
        )
    }

    return {
        onTap: authenticate,
    }
}
