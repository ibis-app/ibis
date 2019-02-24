import './reload'
import './semantic.api'
import './search_bar'

declare var $: JQueryStatic

$('#modality-menu-toggle').click(() => {
    let menu: any = $('#modality-menu') as any;
    if (menu) {
        menu.sidebar('toggle')
    }
});

($('.ui.button.htm-link') as any).api({
    encodeParameters: false,
    onSuccess: (data: any) => {
        console.dir(data)
    }
})