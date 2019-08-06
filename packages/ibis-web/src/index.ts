// TODO: use vue, vue-router, pouchdb to wire together a working app
import Vue from "/web_modules/vue.js"
import router from "./router/index"
import App from "./app"

var myApp = new Vue({
    el: "#app",
    render: (h) => h(App),
    router
})
