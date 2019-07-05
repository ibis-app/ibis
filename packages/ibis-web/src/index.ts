// TODO: use vue, vue-router, pouchdb to wire together a working app
import Vue from "/web_modules/vue.js"
import HelloWorld from "./components/hello-world/index"

Vue.component("hello-world", HelloWorld)

var myApp = new Vue({
    el: "#app",
    render: (h) => h(HelloWorld)
});
