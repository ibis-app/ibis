interface Window {
    handlers?: { [key: string]: any }
}

function search(...args: any[]) {
    console.log('searched')
    console.dir(args)
}

if (window.handlers) {
    window.handlers.search = search
} else {
    window.handlers = {
        search: search
    }
}