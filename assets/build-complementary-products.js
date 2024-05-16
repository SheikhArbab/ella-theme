if (typeof complementaryProductsComponent === 'undefined')
{   
    class ComplementaryProductsComponent extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            const url = this.dataset.url;

            this.buildProducts(url);    
        }

        buildProducts(url) {
            const fetchProducts = async (url) => {
                const res = await fetch(url);
                let text = await res.text();
                    
                const html = document.createElement('div');
                text = text.replaceAll('variant-selects', 'div').replaceAll('variant-radios', 'div').replaceAll('product-tab', 'div').replaceAll('compare-color', 'div');
                html.innerHTML = text;
                
                const recommendations = html.querySelector('[data-complementary-product]');
                if (recommendations && recommendations.innerHTML.trim().length) {
                    this.innerHTML = recommendations.innerHTML;
    
                    if (window.sharedFunctions.checkNeedToConvertCurrency()) {
                        Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                    }
                }
                    
                const productCarousel = this.querySelector('.products-carousel');
                this.initializeSlider(productCarousel);
            }
    
            fetchProducts(url);
        }
        
        initializeSlider(productCarousel = null) {
            if (productCarousel) {
                const itemArrows = productCarousel.dataset.itemArrows === 'true';
                const itemDots = productCarousel.dataset.itemDots === 'true';
                const itemRows = parseInt(productCarousel.dataset.itemRows);
                const itemToShow = parseInt(productCarousel.dataset.itemToShow);
                const complementaryStyle = this.classList.contains('style-1') ? true : false;

                $(productCarousel).on('init', () => {
                    this.calculateCard06Padding();
                });

                if(!productCarousel.classList.contains('slick-slider')) {
                    $(productCarousel).slick({
                        dots: itemDots,
                        arrows: itemArrows,
                        slidesToShow: complementaryStyle ? itemToShow : 1,
                        rows: !complementaryStyle ? itemRows : 1,
                        slidesToScroll: 1,
                        slidesPerRow: 1,
                        infinite: true,
                        rtl: window.rtl_slick,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        responsive: [
                            {
                                breakpoint: 1025,
                                settings: {
                                    get slidesToShow() {
                                        if (complementaryStyle) {
                                            slidesToShow: 2
                                        }
                                        if (!complementaryStyle) {
                                            slidesToShow: 1
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 992,
                                settings: {
                                    get slidesToShow() {
                                        if (complementaryStyle) {
                                            slidesToShow: 2
                                        }
                                        if (!complementaryStyle) {
                                            slidesToShow: 1
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 768,
                                settings: {
                                    get slidesToShow() {
                                        if (complementaryStyle) {
                                            slidesToShow: 2
                                        }
                                        if (!complementaryStyle) {
                                            slidesToShow: 1
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 321,
                                settings: {
                                    slidesToShow: 1
                                }
                            }
                        ]
                    });
                }
            }
        }
        
        calculateCard06Padding() {
            if (!document.body.classList.contains('product-card-layout-06')) return;

            const selectOptionsHeight = this.querySelector('.product .card-action').scrollHeight;
            this.querySelector('.slick-list').style.paddingBottom = selectOptionsHeight + 'px';
        }
    }
    
    window.addEventListener('load', () => {
        customElements.define('complementary-products', ComplementaryProductsComponent);
    })

    var complementaryProductsComponent = ComplementaryProductsComponent;
}