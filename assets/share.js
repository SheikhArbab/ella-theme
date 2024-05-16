window.shareProduct = function() {
    class ShareButton extends HTMLElement {
        constructor() {
            super();

            this.elements = {
                shareButton: this.querySelector('button'),
                successMessage: this.querySelector('[id^="ShareMessage"]'),
                urlInput: this.querySelector('input'),
                content: this.querySelector('.share-button__fallback'),
                copyButton: this.querySelector('.button-copy'),
                closeButton: this.querySelector('.share-button__close')
            }

            this.elements.shareButton.addEventListener('click', this.toggleDetails.bind(this));
            this.elements.copyButton.addEventListener('click', this.copyToClipboard.bind(this));
            this.elements.closeButton.addEventListener('click', this.closeDetails.bind(this));
            document.querySelector('.background-overlay').addEventListener('click', this.closeDetails.bind(this));
        }

        toggleDetails(event) {
            event.preventDefault();
            event.stopPropagation();
            const url = this.elements.urlInput.getAttribute('data-url');

            this.getPosition();
            // this.setProductInfoTop(this.getProductInfoPosition());

            this.elements.successMessage.classList.add('hidden');
            this.elements.urlInput.setAttribute('value', url);
            this.elements.urlInput.classList.remove('is-copy');
            this.elements.content.classList.toggle('is-open');
            document.querySelector('body').classList.add('modal-share-open');

        }

        copyToClipboard(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.elements.urlInput.classList.contains('is-copy')) {
                navigator.clipboard.writeText(this.elements.urlInput.value).then(() => {
                    this.elements.successMessage.setAttribute('aria-hidden', false);
                    this.elements.urlInput.setAttribute('value', 'Link copied to clipboard!');
                    this.elements.urlInput.classList.add('is-copy');

                    setTimeout(() => {
                        this.elements.successMessage.setAttribute('aria-hidden', true);
                    }, 6000);
                });
            }
        }
        
        closeDetails(event) {
            event.preventDefault();
            // event.stopPropagation();
            const url = this.elements.urlInput.getAttribute('data-url');

            this.elements.successMessage.classList.add('hidden');
            this.elements.urlInput.setAttribute('value', url);
            this.elements.urlInput.classList.remove('is-copy');
            this.elements.content.classList.remove('is-open');
            document.querySelector('body').classList.remove('modal-share-open')
            // this.setProductInfoTop(0);
        }

        getPosition() {
            if (window.innerWidth <= 1024 || this.elements.shareButton.closest('[data-quick-view-popup]') != null) return;

            const shareButtonRect = this.elements.shareButton.getBoundingClientRect()

            const y = shareButtonRect.top;
            const x = shareButtonRect.left;
            
            const width = this.elements.content.getBoundingClientRect().width;
            const shareHeight = shareButtonRect.height;
            const shareWidth = shareButtonRect.width;

            const left = x - width + shareWidth;
            const top = y + shareHeight + 10;

            this.elements.content.style.setProperty('--share-desk-top', top + 'px');
            this.elements.content.style.setProperty('--share-desk-left', left + 'px');
        }

        getProductInfoPosition() {
            const productDetails = document.querySelector('.productView-details')
            return productDetails?.offsetTop
        }   

        setProductInfoTop(top) {
            const productDetails = document.querySelector('.productView-details')
            productDetails?.style.setProperty('--sticky-top', top + 'px')
        } 
    }

    customElements.define('share-button', ShareButton);
};

var shareShow = document.body.classList.contains('quick-view-show'),
    productShare = $('.halo-productView .productView-share').length;

if (document.body.classList.contains('template-product')) {
    if (!shareShow && productShare) {
        window.shareProduct();
    } else if (shareShow && productShare === 0) {
        window.shareProduct();
    }
} else {
    window.shareProduct();
}