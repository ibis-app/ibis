import Vue from "/web_modules/vue.js"
import HelloWorld from "./../components/hello-world/index"
import Router, { RouteConfig } from "/web_modules/vue-router.js"

const routes: RouteConfig[] = [
    {
        path: "/help",
        component: {
            template: "there is no help"
        }
    },
    {
        path: "/",
        component: HelloWorld
    }
]

Vue.use(Router)

export default new Router({
    routes
})
