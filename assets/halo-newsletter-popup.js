class NewsletterPopup extends HTMLElement {
    constructor() {
        super();

        this.popup = this;
        this.timeToShow = parseInt(this.popup.getAttribute('data-delay'));
        this.expiresDate = this.popup.getAttribute('data-expire');
        if (this.getCookie('newsletter-popup') === ''){
            var popup = this.popup;

            setTimeout(function() {
                document.body.classList.add('newsletter-show');
            }, this.timeToShow);

            setTimeout(() => {
                document.body.classList.add('show-newsletter-image');
            }, this.timeToShow + 700)
        } else {
            // this.deleteCookie('newsletter-popup');
        }
        
        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));

        this.querySelector('[data-close-newsletter-popup]').addEventListener(
            'click',
            this.setClosePopup.bind(this)
        );

        this.querySelector('#ContactPopup').addEventListener(
            'submit',
            this.setClosePopup.bind(this)
        );
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    getCookie(cname) {
        const name = cname + '=';
        const ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }

    deleteCookie(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setClosePopup() {
        this.setCookie('newsletter-popup', 'closed', this.expiresDate);
        document.body.classList.remove('newsletter-show');
        setTimeout(() => {
            document.body.classList.remove('show-newsletter-image');
        }, 700)
    }

    onBodyClickEvent(event){
        if ((!this.contains(event.target)) && ($(event.target).closest('[data-open-newsletter-popup]').length === 0) && document.querySelector('body').classList.contains('newsletter-show')){
            this.setClosePopup();
        }
    }
}

customElements.define('newsletter-popup', NewsletterPopup);

class NewsletterMessagePopup extends HTMLElement {
    constructor() {
        super();

        this.querySelector('[data-close-newsletter-message-popup]').addEventListener(
            'click',
            this.close.bind(this)
        );

        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
    }

    close(){
        document.body.classList.remove('newsletter-message-show');
    }

    onBodyClickEvent(event){
        if (!this.contains(event.target)){
            this.close();
        }
    }
}

customElements.define('newsletter-message-popup', NewsletterMessagePopup);