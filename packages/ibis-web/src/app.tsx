import { CreateElement, VNode } from "/web_modules/vue.js"

export default {
    render(h: CreateElement): VNode {
        return (<div class="app">
            Here is words
            <nav>
                <router-link to="/hello-world">Hi!</router-link>
            </nav>

            <main>
                <router-view></router-view>
            </main>
        </div>);
    }
}
