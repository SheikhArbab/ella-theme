if (typeof lookbookDialogRef === 'undefined') {
    class LookbookDialogDot extends HTMLElement {
        constructor() {
            super();
        }
        
        connectedCallback() {
            this.RESERVED_SPACE = 20;
            this.left = 0;
            this.top = 0;
            this.inLeftHalf = true;
    
            this.dialog = this.querySelector('[data-lookbook-dialog]');
            this.productItem = this.querySelector('.product-item');
    
            // a product card doens't have close button, 
            // but lookbook product card does
    
            this.closeDialogButton = this.querySelector('[data-close-lookbook-dialog-button]');
            this.productItem.appendChild(this.closeDialogButton);
    
            if (window.innerWidth > 1024) { 
                this.addEventListener('click', this.toggleDialog.bind(this));
            } else {
                this.closeDialogButton.style.display = 'none';
            }
    
            window.addEventListener('resize', this.onResize.bind(this));
        }           
    
        onResize() {
            if (window.innerWidth > 1024) { 
                this.removeEventListener('click', this.toggleDialog.bind(this));
                this.addEventListener('click', this.toggleDialog.bind(this));
    
                this.closeDialogButton.style.display = 'block';
            } else {    
                this.removeEventListener('click', this.toggleDialog.bind(this));
                this.closeDialogButton.style.display = 'none';
            }
    
            if (this.dialog.hasAttribute('open')) this.closeDialog();
        }
    
        resetPosition() {
            this.left = 0;
            this.top = 0;
            this.setPosition();
        }   
    
        toggleDialog(e) {
            if (window.innerWidth <= 1024) return;
    
            if (e.target.matches('[data-close-lookbook-dialog-button]')) return this.closeDialog();
            if (this.checkIsQuickshop3(e)) return this.closeDialog();
            if (this.checkIsQuickView(e)) return this.closeDialog();
    
            if (e.target.closest('.product-item') || e.target.matches('.product-item')) return;
            if (this.dialog.hasAttribute('open')) return this.closeDialog();
    
            if (e.target.matches('.glyphicon')) {
                e.stopImmediatePropagation();
                this.openDialog();
            }
        }
    
        checkIsQuickshop3(e) {
            if (!document.body.classList.contains('quick_shop_option_3')) return false;
            return e.target.matches('[data-quickshop-popup]') || e.target.closest('[data-quickshop-popup]');
        }

        checkIsQuickView(e) {
            return e.target.matches('[data-open-quick-view-popup]') || e.target.closest('[data-open-quick-view-popup]') || e.target.matches('.card-quickview');
        }
    
        openDialog() {
            this.currentTop = window.scrollY;
    
            this.resetPosition();
            this.dialog.showModal();
            this.calculatePosition({ currentWindowTop: this.currentTop });
            this.setPosition();
    
            window.scrollTo({
                top: this.currentTop
            })
    
            this.productItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    
        closeDialog() {
            this.productItem.classList.add('closing');
    
            setTimeout(() => {
                this.resetPosition();
                this.dialog.close();
                this.productItem.classList.remove('closing');
            }, 500);
        }
    
        calculatePosition({ currentWindowTop }) {
            const lookbookDotBox = this.getBoundingClientRect();
            const dialogBox = this.productItem.getBoundingClientRect();
    
            if (window.innerWidth > 1024) {
                const { left: dotLeft, right: dotRight, top: dotTop, width: dotWidth } = lookbookDotBox;
                const { left: dialogLeft, top: dialogTop, width: dialogWidth, height: dialogHeight } = dialogBox;
    
                const axis = window.innerWidth / 2;
                const dotAxis = dotLeft + dotWidth / 2;
                if (dotAxis > axis) this.inLeftHalf = false;
    
                this.left = LookbookDialogDot.getLeft({
                    inLeftHalf: this.inLeftHalf,
                    reservedSpace: this.RESERVED_SPACE,
                    right: dotRight,
                    left: dotLeft,
                    dialogLeft,
                    dialogWidth
                });
    
                this.top = LookbookDialogDot.getTop({
                    top: dotTop,
                    dialogHeight,
                    dialogTop,
                    currentWindowTop,
                    reservedSpace: this.RESERVED_SPACE,
                });
               
            } else {
                this.top = 50;
                this.left = 50;
            }
        }
    
        setPosition() {
            this.productItem.style.setProperty('--top', this.top);
            this.productItem.style.setProperty('--left', this.left);
        }
    
        static getLeft(params) {
            const { inLeftHalf, reservedSpace, right, left, dialogLeft, dialogWidth } = params;
    
            let intendedLeft, deltaLeft;
    
            if (inLeftHalf) {
                // The popup will to the right of the dot if the dot is on the half left of the screen;
    
                intendedLeft = right + reservedSpace;
                deltaLeft = -1 * (dialogLeft - intendedLeft);
            } else {    
                // The popup will to the left of the dot if the dot is on the half right of the screen;
    
                intendedLeft = left - reservedSpace - dialogWidth;  
                deltaLeft = intendedLeft - dialogLeft;
            }
    
            return deltaLeft;
        }
    
        static getTop(params) {
            const { top, dialogHeight, reservedSpace, dialogTop, currentWindowTop } = params;
            let intendedTop, deltaTop;
    
            if (top + dialogHeight + reservedSpace > currentWindowTop + window.innerHeight) {
                // The popup will be far down relative to the dot if there's enough bottom space for it in the viewport;
    
                intendedTop = top - dialogHeight + reservedSpace;
                deltaTop = -1 * (dialogTop - intendedTop)
            } else {        
                // The popup will be far up relative to the dot if there's NOT enough bottom space for it in the viewport;
    
                intendedTop = top - reservedSpace;
                deltaTop = (intendedTop - dialogTop);
            }
    
            return deltaTop;
        }
    }
    
    class LookbookWrapper extends HTMLElement {
        constructor() {
            super()
        }
    
        connectedCallback() {
            this.lookbookIcons = [...this.querySelectorAll('[data-lookbook-icon]')];
            this.initialized = false;
    
            if (window.innerWidth <= 1024) {
                this.lookbookIcons.forEach((icon) => {
                    icon.addEventListener('click', this.onClick.bind(this));
                })
            }       
            window.addEventListener('resize', this.onResize.bind(this));
    
            setTimeout(() => {
                this.initialized = true;
            }, 150)
        }   
    
        onResize() {
            if (window.innerWidth <= 1024) {
                this.lookbookIcons.forEach(icon => {
                    icon.removeEventListener('click', this.onClick.bind(this));
                    icon.addEventListener('click', this.onClick.bind(this));
                })  
            } else {
                this.lookbookIcons.forEach(icon => {
                    icon.removeEventListener('click', this.onClick.bind(this));
                })
            }
        }
    
        onClick(e) {
            if (window.innerWidth > 1024 || !this.initialized) return;
            this.buildPopup(e);
        }
    
        buildPopup(e) {
            const icon = e.currentTarget;
            const currentIndex = this.lookbookIcons.indexOf(icon);
    
            this.lookbookIcons.forEach(icon => {
                const productItem = icon.querySelector('.product-item');
                const dialog = icon.querySelector('[data-lookbook-dialog]');
    
                if (productItem) {
                    const signature = `sig-${productItem.dataset.productId}-${Date.now().toString()}`;
    
                    dialog.dataset.signature = signature;
                    productItem.dataset.signature = signature;
                    
                    LookbookMobilePopup.appendItem(productItem);
                }
            })
    
            LookbookMobilePopup.togglePopup(true, currentIndex);
        }
    }
    
    class LookbookMobilePopup extends HTMLElement {
        constructor() {
            super();
        }
    
        connectedCallback() {
            this.contentWrapper = this.querySelector('[data-lookbook-mobile-images-container]');
            this.closeButton = this.querySelector('[data-close-lookbook-modal]');
    
            this.closeButton.addEventListener('click', () => {
                LookbookMobilePopup.togglePopup(false);
            })
            this.addEventListener('click', this.onSelfClick.bind(this));
            window.addEventListener('resize', this.onResize.bind(this));
        }
    
        onSelfClick(e) {
            if (e.target.tagName.toLowerCase() === 'lookbook-mobile-popup') {
                LookbookMobilePopup.togglePopup(false); 
                document.getElementById('halo-card-mobile-popup')?.classList.remove('show');
                document.body.classList.remove('quick_shop_popup_mobile');
            }
        }
    
        onResize() {
            LookbookMobilePopup.togglePopup(false);
        }
    
        static appendItem(item) {
            const contentWrapper = document.querySelector('[data-lookbook-popup-mobile] [data-lookbook-mobile-images-container]')
            contentWrapper.appendChild(item)
        }
    
        static togglePopup(isOpen, indexToScroll = 0) {
            const contentWrapper = document.querySelector('[data-lookbook-popup-mobile] [data-lookbook-mobile-images-container]');
    
            LookbookMobilePopup.checkAndSetOverflowing(contentWrapper);
            document.body.classList.toggle('mobile-popup-active', isOpen);
            
            if (isOpen) {
                setTimeout(() => {
                    document.querySelectorAll('[data-lookbook-popup-mobile] .product-item')[indexToScroll]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400)
            } else {
                const items = contentWrapper.querySelectorAll('[data-signature]');
    
                setTimeout(() => {
                    items.forEach(item => {
                        const signature = item.dataset.signature;
                        const dialog = document.querySelector(`[data-lookbook-dialog][data-signature="${signature}"]`);
                        dialog.appendChild(item);
                    })
                }, 350)
            }
        }
    
        static checkAndSetOverflowing(contentWrapper = null) {
            if (!contentWrapper) return;
            contentWrapper.classList.toggle('center', contentWrapper.scrollWidth <= contentWrapper.clientWidth);
        }
    }
    
    var lookbookDialogRef = LookbookDialogDot;
    
    window.addEventListener('load', () => {
        customElements.define('lookbook-dialog-dot', LookbookDialogDot);
        customElements.define('lookbook-wrapper', LookbookWrapper)
        customElements.define('lookbook-mobile-popup', LookbookMobilePopup)
    })
}