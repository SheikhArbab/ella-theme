class RecentlyViewed extends HTMLElement {
    constructor() {
        super();

        this.popup = this;
        this.expireDay = this.popup.getAttribute('data-expire-day');
        this.limit = this.popup.getAttribute('data-product-to-show');
        this.icon = this.getElementsByClassName('recently-viewed-icon');
        this.tab = this.getElementsByClassName('recently-viewed-tab');
        this.noProduct = this.getElementsByClassName('no-products')[0],
        this.iconClose = this.getElementsByClassName('button__close');
        
      
        const recentlyViewed = $(this.popup);

        Shopify.Products.recordRecentlyViewed();

        var cookieValue = $.cookie('shopify_recently_viewed');

        if (!(cookieValue !== null && cookieValue !== undefined && cookieValue !== "")){
            this.noProduct ? this.noProduct.style.display = 'flex' : null;
            this.popup.classList.add('is-show');
        } else {
            var limit = this.limit,
                expireDay = this.expireDay;

            Shopify.Products.showRecentlyViewed({ 
                howManyToShow: limit,
                wrapperId: 'recently-viewed-products-list', 
                templateId: 'recently-viewed-product-popup',
                onComplete: function() {
                    recentlyViewed.find('.no-products').remove();
                    recentlyViewed.addClass('is-show');

                    var recentlyGrid = recentlyViewed.find('.products-grid'),
                        productGrid = recentlyGrid.find('.item');

                    if (productGrid.length > 0){
                        if(recentlyGrid.is(':visible')) {
                            if (window.innerWidth < 767) {
                                if (productGrid.length > 2) {
                                    recentlyGrid.addClass('has-arrow');
                                }
                            } else{
                                if (productGrid.length > 3) {
                                    recentlyGrid.addClass('has-arrow');
                                }
                            }
                        }
                    }
                    recentlyGrid.on('mouseenter', '.item', (event) => {
                        event.preventDefault();

                        var $currTarget = $(event.currentTarget), 
                            current = recentlyGrid.find('.slick-active'),
                            index = current.index($currTarget),
                            content = $currTarget.find('.second-info').html(),
                            productInfo = $('.product-info', recentlyGrid),
                            marginTop = Math.abs(index) * productInfo.outerHeight();

                        productInfo
                            .html(content)
                            .css('margin-top', marginTop)
                            .show();
                    });

                    recentlyGrid.on('mouseenter', '.slick-arrow', (event) => {
                        $('.product-info', recentlyGrid).hide();
                    });

                    recentlyGrid.on('click', 'a[data-mobile-click]', (event) => {
                        if (window.innerWidth < 768) {
                           event.preventDefault();
                        }
                    });

                    if (window.location.pathname.indexOf('/products/') !== -1) {
                        $.cookie('shopify_recently_viewed', cookieValue, { expires: expireDay, path: "/", domain: window.location.hostname });
                    }
                }
            });
        }
        
        $('#recently-viewed-products-share').on('click', '[data-open-newsletter-popup]', (event) => {
            event.preventDefault();

            document.body.classList.add('newsletter-show');
            setTimeout(() => {
                document.body.classList.add('show-newsletter-image');
            }, 700)
        });
        
        for (let i = 0; i < this.icon.length; i++) {
            this.icon[i].addEventListener('click', this.popup.iconClick.bind(this));
        }

        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
        
        for (let i = 0; i < this.iconClose.length; i++) {
            this.iconClose[i].addEventListener('click', this.popup.closeDetails.bind(this));
        }
    }

    iconClick(event){
        var $currTarget = event.currentTarget,
            $recentlyViewed = this.popup;

        if($currTarget.classList.contains('open-popup')){
            var currPopup = $currTarget.getAttribute('data-target');

            if($currTarget.classList.contains('is-open')){
                $currTarget.classList.remove('is-open');
                document.getElementById(currPopup)?.classList.remove('is-visible');
                document.querySelector('body').classList.remove('recently-popup-mb-show');
            } else {
                this.closeTab();
                $currTarget.classList.add('is-open');
                document.getElementById(currPopup)?.classList.add('is-visible');
                const recentlyGrid = $(`#${currPopup}`).find('.products-grid');
                
                if (window.innerWidth < 1025) {
                    document.querySelector('body').classList.add('recently-popup-mb-show');
                    $('.recently-viewed-popup-mb .halo-recently-viewed').hide();
                    if ($('.recently-viewed-popup-mb').find(`#${currPopup}`).length) {
                        $(`#${currPopup}`).show();
                    }
                    else {
                        $('.recently-viewed-popup-mb').append($(document.getElementById(currPopup)));
                    }
                    if (currPopup == 'halo-recently-viewed-list' && recentlyGrid.hasClass('slick-initialized')) {
                        recentlyGrid.slick('unslick');
                        recentlyGrid.find('.product-info').remove();
                    }
                }else{
                    $('.halo-recently-viewed-popup').append($('.recently-viewed-popup-mb .halo-recently-viewed'));
                    if (currPopup == 'halo-recently-viewed-list' && !recentlyGrid.hasClass('slick-initialized')) {
                        const productGrid = recentlyGrid.find('.item');
                        if (productGrid.length > 2) {
                            recentlyGrid.slick({
                                infinite: false,
                                speed: 1000,
                                slidesToShow: 3,
                                dots: false,
                                arrows: true,
                                vertical: true,
                                slidesToScroll: 1,
                                adaptiveHeight: true,
                                nextArrow: '<button type="button" class="slick-next" aria-label="Next"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><title>ic-arrow-right</title><path d="M15.111 12L8 4.889 8.889 4l8 8-8 8L8 19.111z"></path></svg></button>', 
                                prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><title>ic-arrow-left</title><path d="M8.778 12l7.111-7.111L15 4l-8 8 8 8 .889-.889z"></path></svg></button>',
                                responsive: [
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToScroll: 1,
                                            slidesToShow: 1
                                        }
                                    }
                                ]
                            });
                        } else if (productGrid.length > 1) {
                            recentlyGrid.slick({
                                infinite: false,
                                speed: 1000,
                                slidesToShow: 2,
                                dots: false,
                                arrows: true,
                                vertical: true,
                                slidesToScroll: 1,
                                adaptiveHeight: true,
                                nextArrow: '<button type="button" class="slick-next" aria-label="Next"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><title>ic-arrow-right</title><path d="M15.111 12L8 4.889 8.889 4l8 8-8 8L8 19.111z"></path></svg></button>', 
                                prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><title>ic-arrow-left</title><path d="M8.778 12l7.111-7.111L15 4l-8 8 8 8 .889-.889z"></path></svg></button>',
                                responsive: [
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToScroll: 1,
                                            slidesToShow: 1
                                        }
                                    }
                                ]
                            });
                        }

                        if (productGrid.length == 0) recentlyGrid.addClass('not-product');
                        recentlyGrid.prepend('<div class="product-info"></div>');
                    }
                }
            }
        }

        if (document.body.classList.contains('recently-popup-mb-show')){
            document.querySelector('.background-overlay').addEventListener('click', this.closeDetails.bind(this));
        }
    }

    closeDetails(event) {
        event.preventDefault();
        event.stopPropagation();

        if (document.body.classList.contains('ask-an-expert-show')){
           document.querySelector('body').classList.remove('ask-an-expert-show');
        }
        document.querySelector('body').classList.remove('recently-popup-mb-show');
        this.closeTab();
    }
    

    closeTab(){
        for (let i = 0; i < this.icon.length; i++) {
            this.icon[i].classList.remove('is-open');
        }

        for (let i = 0; i < this.tab.length; i++) {
            this.tab[i].classList.remove('is-visible');
        }
    }

    onBodyClickEvent(event){
        if (!this.contains(event.target)){
            this.closeTab();
        }
    }
}

customElements.define('recently-viewed-popup', RecentlyViewed);

class BackToTopButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.sideIcons = [...document.getElementsByClassName('recently-viewed-icon')];

        this.addEventListener('click', e => {
            e.preventDefault();

            this.sideIcons.forEach(icon => {
                const popup = document.getElementById(icon.dataset.target);

                if (!popup) return;

                popup.classList.remove('is-open');
                popup.classList.remove('is-visible');
            })
            
            $('html, body').animate({
                scrollTop: 0
            }, 700);

        })

        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll() {
        const currentTop = window.pageYOffset || document.body.scrollTop;
        const pageHeight = document.body.scrollHeight;

        if (currentTop / pageHeight <= 0.07) return this.hide();
        this.show();
    }

    hide() {
        this.dataset.scrollToTop = false;   
    }

    show() {
        this.dataset.scrollToTop = true;   
    }
}

customElements.define('back-to-top-button', BackToTopButton);