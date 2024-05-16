if (typeof localizationForm === 'undefined') {
    class LocalizationForm extends HTMLElement {
        constructor() {
            super();
            this.elements = {
                input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
                button: this.querySelector('button'),
                panel: this.querySelector('ul'),
            };
            // this.elements.button.addEventListener('click', this.openSelector.bind(this));
            // this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
            this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
    
            // document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
    
        }
    
        onItemClick(event) {
            event.preventDefault();
            this.elements.input.value = event.currentTarget.dataset.value;
            this.querySelector('form')?.submit();
        }
    
        openSelector() {
            this.elements.button.focus();
            this.elements.panel.toggleAttribute('hidden');
            this.elements.button.setAttribute('aria-expanded', (this.elements.button.getAttribute('aria-expanded') === 'false').toString());
        }
    
        closeSelector(event) {
            const shouldClose = event.relatedTarget && event.relatedTarget.nodeName === 'BUTTON';
            if (event.relatedTarget === null || shouldClose) {
                this.elements.button.setAttribute('aria-expanded', 'false');
                this.elements.panel.setAttribute('hidden', true);
            }
        }
    
        onBodyClickEvent(event){
            if ((!this.contains(event.target)) && ($(event.target).closest('[localization-form__select]').length === 0)){
                this.closeSelector(event);
            }
        }
    }
    
    customElements.define('localization-form', LocalizationForm);

    var localizationForm = LocalizationForm;
}