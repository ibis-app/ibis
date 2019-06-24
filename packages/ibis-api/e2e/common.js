// @ts-check
const { withEntrypoint } = require("@ibis-app/lib");
const test = require("ava");
const { get } = require("request");

module.exports = function(options) {
    const withApi = withEntrypoint({ ...options, host_env: "API_HOSTNAME", port_env: "API_PORT" })

    test("It should serve a 204 for root", withApi, async (t, port) => {
        await new Promise((resolve, reject) => {
            get(`http://0.0.0.0:${port}`)
                .on('response', (response) => {
                    t.is(204, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });
    })
};