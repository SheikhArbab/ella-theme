class FAQs extends HTMLElement {
    constructor() {
        super();

        this.filter = document.getElementById('haloFAQsFilter');
        this.faqsPopup = document.getElementById('halo-faqs-popup');

        if(this.filter){
            this.filterToggle = this.filter.querySelector('[data-faqs-filter]');
            this.filterDropdown = this.filter.querySelector('.faqs-filterDropdown-menu');
            this.filterDropdownArrow = this.filterToggle.querySelector('[data-dropdown-arrow]')
            
            if(this.filterToggle){
                this.filterToggle.addEventListener('click', this.onClickFilterHandler.bind(this));
            }

            if(this.filterDropdown.querySelector('.text')){
                this.filterDropdown.querySelectorAll('.text').forEach((filterButton) => {
                    filterButton.addEventListener('click', this.onClickFilterButtonHandler.bind(this));
                });
            }
        }

        if(this.querySelector('.faqs')){
            this.querySelectorAll('.card-header').forEach((headerButton) => {
                headerButton.addEventListener('click', this.onClickHeaderButtonHandler.bind(this));
            });
        }

        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
    }

    onClickFilterHandler(){
        if(this.filterDropdown.classList.contains('is-show')){
            this.filterDropdown.classList.remove('is-show');
            this.filterDropdownArrow.classList.remove('active')
        } else {
            this.filterDropdown.classList.add('is-show');
            this.filterDropdownArrow.classList.add('active')
        }
    }

    onClickFilterButtonHandler(event){
        var btn = event.target.closest('li');

        if(!btn.classList.contains('is-active')){
            var filterValue = btn.getAttribute('data-value'),
                filterText = event.target.innerText;

            this.filterToggle.querySelector('.text').innerText = filterText;

            this.filterDropdown.querySelectorAll('li').forEach((element) => {
                element.classList.remove('is-active');
            });

            btn.classList.add('is-active');

            if(filterValue !== undefined && filterValue !== null){
                this.querySelectorAll('.faqs-paragraph').forEach((element) => {
                    var id = element.getAttribute('id');

                    if(id == filterValue){
                        element.classList.remove('is-hidden');
                        element.classList.add('is-active');
                    } else {
                        element.classList.remove('is-active');
                        element.classList.add('is-hidden');
                    }
                });
            } else {

                this.querySelectorAll('.faqs-paragraph').forEach((element) => {
                    element.classList.remove('is-hidden', 'is-active');
                });
            }

            this.filterDropdown.classList.remove('is-show');
            this.filterDropdownArrow.classList.remove('active')
        }
    }

    onClickHeaderButtonHandler(event){
        const btn = event.currentTarget
        const content = btn.nextElementSibling

        btn.classList.toggle('collapsed');

        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }

    onBodyClickEvent(event) {
        if (event.target.closest('[data-faqs-filter]') != null) return
        if(this.filterDropdown.classList.contains('is-show')) {
            this.filterDropdown.classList.remove('is-show')
            this.filterDropdownArrow.classList.remove('active')
        }
    }
}

customElements.define('faqs-item', FAQs);