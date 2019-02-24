import './reload'
import './semantic.api'
import { search } from './search_box'

declare var $: JQueryStatic

$('#modality-menu-toggle').click(() => {
    let menu: any = $('#modality-menu') as any;
    if (menu) {
        menu.sidebar('toggle')
    }
});

$('form.search-box').submit(search);

($('.ui.button.htm-link') as any).api({
    encodeParameters: false,
    onSuccess: (data: any) => {
        console.dir(data)
    }
})