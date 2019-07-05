// TODO: use vue, vue-router, pouchdb to wire together a working app
import Vue from "/web_modules/vue/dist/vue.js"

Vue.component("hello-world", {
    template: "<div>Hello {{magic}}!</div>",
    data: () => ({
        magic: "world"
    })
})

var myApp = new Vue({
    el: "#app",
    data: {
        magic: "Words!"
    }
});

console.log("hello, world!")
