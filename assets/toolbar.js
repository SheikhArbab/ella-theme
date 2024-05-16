class Toolbar extends HTMLElement {
    constructor() {
        super();

        this.stickyBounds = document.getElementById('CollectionProductGrid').querySelector('.productListing');
        this.queryParams();
        this.closeModalClick();

        if(this.querySelector('[data-view-as]')){
            this.mediaView = this.querySelector('[data-view-as]');
            this.mediaViewMobile = this.querySelector('[data-view-as-mobile]');

            this.mediaView.querySelectorAll('.icon-mode').forEach((modeButton) => {
                modeButton.addEventListener('click', this.onClickModeButtonHandler.bind(this));
            });

            this.mediaViewMobile.querySelectorAll('.icon-mode').forEach((modeMobileButton) => {
                modeMobileButton.addEventListener('click', this.onClickModeButtonMobileHandler.bind(this));
            });

            this.debouncedOnResizeMediaQuery = debounce(() => {
                this.setActiveViewModeMediaQuery(false);
            }, 200);

            var w = window.innerWidth;

            window.addEventListener('resize', () => {
                if (window.innerWidth == w) {
                    return 
                }

                w = window.innerWidth;

                this.debouncedOnResizeMediaQuery();
            });

            window.addEventListener('load', () => {
                this.debouncedOnResizeMediaQuery();
            });
        }

        if(this.querySelector('[data-limited-view]')){
            this.limitView = this.querySelector('[data-limited-view]');

            this.limitView.querySelectorAll('[data-limited-view-item]').forEach((limitButton) => {
                limitButton.addEventListener('click', this.onClickLimitButtonHandler.bind(this));
            });
        }

        if(this.querySelector('[data-toggle]')){
            this.querySelectorAll('[data-toggle]').forEach((dropdownButton) => {
                dropdownButton.addEventListener('click', this.onClickDropdownButtonHandler.bind(this));
            });

            document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
        }

        if(this.querySelector('[data-sorting]')){
            this.sortBys = this.querySelectorAll('[data-sorting]');
            const hasItem = this.sortBys[0].querySelector('[data-sort-by-item]') != null
            if(hasItem){
                this.sortBys.forEach(sortBy => {
                    sortBy.querySelectorAll('[data-sort-by-item]').forEach((sortByButton) => {
                        sortByButton.addEventListener('click', this.onClickSortByButtonHandler.bind(this));
                    });
                })
            }
        }

        if(this.checkNeedToConvertCurrency()){
            Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
        }
    }

    queryParams() {
        Shopify.queryParams = {};

        if (location.search.length > 0) {
            for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
                aKeyValue = aCouples[i].split('=');

                if (aKeyValue.length > 1) {
                    Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                }
            }
        }
    }

    createURLHash(baseLink) {
        var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');

        if (baseLink) {
            if (newQuery != "") {
                return baseLink + "?" + newQuery;
            } else {
                return baseLink;
            }
        } else {
            if (newQuery != "") {
                return location.pathname + "?" + newQuery;
            } else {
                return location.pathname;
            }
        }
    }

    updateURLHash(baseLink) {
        delete Shopify.queryParams.page;

        var newUrl = this.createURLHash(baseLink);

        history.pushState({
            param: Shopify.queryParams
        }, newUrl, newUrl);
    }

    checkNeedToConvertCurrency() {
        var currencyItem = $('.dropdown-item[data-currency]');
        if (currencyItem.length) {
            return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
        } else {
            return;
        }
    }

    onClickDropdownButtonHandler(event) {
        var buttonElement = event.currentTarget;

        if (buttonElement.dataset.mobile === 'mobile') {
            // const mobileSortDropdownMenu = this.querySelector('[data-sorting][data-mobile]')
            document.body.classList.add('toolbar-modal-open')
        }

        if (buttonElement.getAttribute('aria-expanded') === 'false'){
            buttonElement.setAttribute('aria-expanded', true);
        } else {
            buttonElement.setAttribute('aria-expanded', false);
        }
    }

    onClickSortByButtonHandler(event) {
        event.preventDefault();

        var buttonElement = event.currentTarget;
        this.sortBy = buttonElement.closest('[data-sorting]')

        if (!buttonElement.classList.contains('is-active')) {
            var value = buttonElement.querySelector('.text').getAttribute('data-value'),
                href = buttonElement.querySelector('.text').getAttribute('data-href'),
                text = buttonElement.querySelector('.text').innerText;

            if (this.sortBy.querySelector('.label-text') != null) {
                this.sortBy.querySelector('.label-text').innerText = text;
            }

            if (this.sortBy.querySelector('[data-toggle]') != null) {
                this.sortBy.querySelector('[data-toggle]')?.setAttribute('aria-expanded', false);
            }

            this.sortBy.querySelectorAll('[data-sort-by-item]').forEach((sortByButton) => {
                sortByButton.classList.remove('is-active');
            });

            buttonElement.classList.add('is-active');

            if (this.sortBy.dataset.mobile === 'mobile') {
                const dropdownButton = this.querySelector('[data-toggle][data-mobile="mobile"]')
                dropdownButton.setAttribute('aria-expanded', false); 
                document.body.classList.remove('toolbar-modal-open');
            }
            
            if(window.show_storefront_filter) {
                const form = document.querySelector('collection-filters-form');
                    form.querySelector('[name="sort_by"]').value = href;
                    form.onSubmitHandlerFromSortBy(event, form.querySelector('form'));
            } else {
                Shopify.queryParams.sort_by = href;
                this.updateURLHash();

                var newUrl = this.createURLHash();
                this.renderPage(newUrl);
            }
        }
    }

    getSections() {
        return [
            {
                id: 'main-collection-product-grid',
                section: document.getElementById('main-collection-product-grid').dataset.id,
            }
        ]
    }

    renderPage(href) {
        const sections = this.getSections();

        // document.getElementById('CollectionProductGrid').querySelector('.collection').classList.add('is-loading');
        document.body.classList.add('has-halo-loader');

        sections.forEach((section) => {
            this.renderSectionFromFetch(href, section);
        });
    }

    renderSectionFromFetch(url, section) {
        fetch(url)
        .then(response => response.text())
        .then((responseText) => {
            const html = responseText;

            this.renderSidebar(html);
            this.renderProductGrid(html);
        });
    }

    renderSidebar(html) {
        if(document.getElementById('main-collection-filters')){
            const innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('main-collection-filters').innerHTML;

            document.getElementById('main-collection-filters').innerHTML = innerHTML;
        }
    }

    renderProductGrid(html) {
        const innerHTML = new DOMParser()
                            .parseFromString(html, 'text/html')
                            .getElementById('CollectionProductGrid')
                            .querySelector('.collection').innerHTML;

        document.getElementById('CollectionProductGrid').querySelector('.collection').innerHTML = innerHTML;

        this.setActiveViewModeMediaQuery(true);

        if(window.compare.show){
            this.setLocalStorageProductForCompare({
                link: $('[data-compare-link]'),
                onComplete: null
            });
        }

        if(window.wishlist.show){
            this.setLocalStorageProductForWishlist();
        }

        if(window.innerWidth < 1025){
            // document.getElementById('CollectionProductGrid').scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            window.scrollTo({
                top: document.getElementById('CollectionProductGrid').getBoundingClientRect().top + window.pageYOffset - 50,
                behavior: 'smooth'
            });
        }

        document.body.classList.remove('has-halo-loader');
    }

    setLocalStorageProductForCompare($link) {
        var count = JSON.parse(localStorage.getItem('compareItem')),
            items = $('[data-product-compare-handle]');

        if(count !== null){ 
            if(items.length > 0) {
                items.each((index, element) => {
                    var item = $(element),
                        handle = item.data('product-compare-handle');

                    if(count.indexOf(handle) >= 0) {
                        item.find('.compare-icon').addClass('is-checked');
                        item.find('.text').text(window.compare.added);
                        item.find('input').prop('checked', true);
                    } else {
                        item.find('.compare-icon').removeClass('is-checked');
                        item.find('.text').text(window.compare.add);
                        item.find('input').prop('checked', false);
                    }
                });
            }
        }
    }
  
    setLocalStorageProductForWishlist() {
        var wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];
        localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));

        if (wishlistList.length > 0) {
            wishlistList = JSON.parse(localStorage.getItem('wishlistItem'));
            
            wishlistList.forEach((handle) => {
                this.setProductForWishlist(handle);
            });
        }
        $('[data-wishlist-count]').text(wishlistList.length);
    }

    setProductForWishlist(handle){
        var wishlistList = JSON.parse(localStorage.getItem('wishlistItem')),
            item = $('[data-wishlist-handle="'+ handle +'"]'),
            index = wishlistList.indexOf(handle);
        
        if(index >= 0) {
            item
                .addClass('wishlist-added')
                .find('.text')
                .text(window.wishlist.added)
        } else {
            item
                .removeClass('wishlist-added')
                .find('.text')
                .text(window.wishlist.add);
        }
    }
  
    setActiveViewModeMediaQuery(ajaxLoading = true){
        var viewMode = this.mediaView?.querySelector('.icon-mode.active'),
            viewModeMobile = this.mediaViewMobile?.querySelector('.icon-mode.active'),
            column = parseInt(viewMode?.dataset.col),
            windowWidth = window.innerWidth;
        
        if(column != 1){
            if(document.querySelector('.sidebar--layout_vertical')){
                if (windowWidth < 768) {
                    if (column == 3 || column == 4 || column == 5) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-2').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth <= 1100 && windowWidth >= 768) {
                    if (column == 5 || column == 4 || column == 3) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-2').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth < 1299 && windowWidth > 1100) {
                    if (column == 5 || column == 4) {
                        column = 3;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-3').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-3').classList.add('active');
                    }
                } else if (windowWidth < 1700 && windowWidth >= 1299) {
                    if (column == 5) {
                        column = 4;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-4').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-4').classList.add('active');
                    }
                }
            } else{
                if (windowWidth < 768) {
                    if (column == 3 || column == 4 || column == 5) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-2').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth < 992 && windowWidth >= 768) {
                    if (column == 4 || column == 5) {
                        column = 3;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-3').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-3').classList.add('active');
                    }
                } else if (windowWidth < 1600 && windowWidth >= 992) {
                    if (column == 5) {
                        column = 4;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        this.mediaView.querySelector('.grid-4').classList.add('active');
                        this.mediaViewMobile.querySelector('.grid-4').classList.add('active');
                    }
                }
            }
            
            this.initViewModeLayout(column);
        } else{
            if(ajaxLoading){
                this.initViewModeLayout(column);
            }
        }
    }
    
    changeBannerPositions(column) {
        const collectionProductGrid = document.getElementById('main-collection-product-grid')
        const productLists = [...collectionProductGrid.querySelectorAll('.product')]
        const banner1 = productLists.find(product => product.dataset.productBanner == 1)
        const banner2 = productLists.find(product => product.dataset.productBanner == 2)
        const banner3 = productLists.find(product => product.dataset.productBanner == 3)
        const bannerLists = [banner1, banner2, banner3]

        const getCurrentPosition = (banner) => {
            const currentIndex = productLists.indexOf(banner) 

            return {
                bannerNumber: banner.dataset.productBanner,
                currentIndex,
                originalIndex: parseInt(banner.dataset.firstPosition)
            }
        }

        const getNextPosition = (info) => {
            let nextPosition = info.currentIndex
            
            switch (column) {
                case 2: {
                    if (info.bannerNumber == 1) {
                        nextPosition = 2
                    } else if (info.bannerNumber == 2) {
                        nextPosition = 5
                    } else if (info.bannerNumber == 3) {
                        nextPosition = 8
                    }
                    collectionProductGrid.classList.add('banner-full-width')
                    break
                }

                case 3: {
                    if (info.bannerNumber == 3 ) {
                        nextPosition = info.originalIndex
                    } else {
                        nextPosition = info.originalIndex - 1
                    }
                    break
                } 

                case 4: {
                    nextPosition = info.originalIndex
                    break
                }

                case 5: {
                    if (info.bannerNumber == 3 ) {
                        nextPosition = info.originalIndex + 3
                    } else {
                        nextPosition = info.originalIndex + 1
                    }
                    break
                } 

                default: {
                    collectionProductGrid.classList.remove('banner-full-width')
                }
            }

            return {
                bannerNumber: info.bannerNumber,
                originalIndex: info.originalIndex,
                currentIndex: nextPosition
            }
        }

        const clearBanner = () => {
            collectionProductGrid.removeChild(banner1)
            collectionProductGrid.removeChild(banner2)
            collectionProductGrid.removeChild(banner3)
        }

        const setBannerPosition = (nextInfo) => {
            const clearedList = [...collectionProductGrid.querySelectorAll('.product')]
            let productBefore = clearedList[nextInfo.currentIndex]

            const bannerToAppend = bannerLists.find(banner => banner.dataset.productBanner == nextInfo.bannerNumber)
            collectionProductGrid.insertBefore(bannerToAppend, productBefore)
        }
        
        const bannersInfo = bannerLists.map(getCurrentPosition) 
        const bannersNextInfo = bannersInfo.map(getNextPosition)
        clearBanner()
        bannersNextInfo.forEach(setBannerPosition)
    }

    initViewModeLayout(column) {
        const productListing = document.getElementById('CollectionProductGrid').querySelector('.productListing');

        if (!productListing) return;

        switch (column) {
            case 1:
                productListing.classList.remove('productGrid', 'column-5', 'column-4', 'column-3', 'column-2');
                productListing.classList.add('productList');

                
                // if(document.body.classList.contains('product-card-layout-01') || document.body.classList.contains('product-card-layout-05')){
                //     if(productListing.classList.contains('productList')){
                //         const cards = productListing.querySelectorAll('.card');
                //         cards.forEach(card => {
                //             const compareInput = card.querySelector('input.compare-checkbox');
                //             compareInput.disabled = true;
                //         })
                //     }
                // }

                break;

            default:
                switch (column) {
                    case 2:
                        productListing.classList.remove('productList', 'column-5', 'column-4', 'column-3');
                        productListing.classList.add('productGrid', 'column-2');

                        break;
                    case 3:
                        productListing.classList.remove('productList', 'column-5', 'column-4', 'column-2');
                        productListing.classList.add('productGrid', 'column-3');

                        break;
                    case 4:
                        productListing.classList.remove('productList', 'column-5', 'column-3', 'column-2');
                        productListing.classList.add('productGrid', 'column-4');

                        break;
                    case 5:
                        productListing.classList.remove('productList', 'column-4', 'column-3', 'column-2');
                        productListing.classList.add('productGrid', 'column-5');

                        break;
                }
        };
        
        if (document.querySelector('.collection-masonry')) {
            resizeAllGridItems();
        }

        if (document.querySelector('.collection-banner-adv')) {
            this.changeBannerPositions(column);
        }
    }

    onClickModeButtonHandler(event){
        event.preventDefault();

        var buttonElement = event.currentTarget,
            viewMode = this.mediaView.querySelector('.icon-mode.active'),
            column = parseInt(buttonElement.dataset.col);

        if(!buttonElement.classList.contains('active')){
            viewMode.classList.remove('active');
            buttonElement.classList.add('active');

            this.mediaViewMobile.querySelectorAll('.icon-mode').forEach((element) => {
                var currentColum = parseInt(element.dataset.col);

                if(currentColum == column){
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            });

            this.initViewModeLayout(column);
        }
    }

    onClickModeButtonMobileHandler(event){
        event.preventDefault();

        var buttonElement = event.currentTarget,
            viewMode = this.mediaViewMobile.querySelector('.icon-mode.active'),
            column = parseInt(buttonElement.dataset.col);

        if(!buttonElement.classList.contains('active')){
            viewMode.classList.remove('active');
            buttonElement.classList.add('active');

            this.mediaView.querySelectorAll('.icon-mode').forEach((element) => {
                var currentColum = parseInt(element.dataset.col);

                if(currentColum == column){
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            });

            this.initViewModeLayout(column);
        }
    }

    onClickLimitButtonHandler(event){
        event.preventDefault();

        var buttonElement = event.currentTarget;

        if(!buttonElement.classList.contains('is-active')){
            var value = parseInt(buttonElement.querySelector('.text').dataset.value);

            this.limitView.querySelector('.label-text').innerText = value;
            this.limitView.querySelector('[data-toggle]').setAttribute('aria-expanded', false);

            this.limitView.querySelectorAll('[data-limited-view-item]').forEach((limitButton) => {
                limitButton.classList.remove('is-active');
            });

            buttonElement.classList.add('is-active');

            $.ajax({
                type: 'POST',
                url: '/cart.js',
                dataType: 'json',
                data: {
                    "attributes[pagination]": value
                },
                success: function (data) {
                    window.location.reload();
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
            });
        }
    }

    connectedCallback(){
        this.onScrollHandler = this.onScroll.bind(this);
        window.addEventListener('scroll', this.onScrollHandler, false);
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.onScrollHandler);
    }

    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offsetScroll = $('#CollectionProductGrid .productListing').offset().top + 100;

        var windowWidth = window.innerWidth;

        if (windowWidth < 1025) {
            if (scrollTop > offsetScroll) {
                requestAnimationFrame(this.showSticky.bind(this));

                if(document.querySelector('.section-header-navigation').classList.contains('shopify-section-header-show')){
                    var height = document.querySelector('.header-mobile').offsetHeight;
                    this.style.top = `${height}px`;
                } else if(document.querySelector('.section-header-mobile').classList.contains('shopify-section-header-hidden')) {
                    this.style.top = 0;
                }
            } else{
                requestAnimationFrame(this.hideSticky.bind(this));
            }
        }

        this.currentScrollTop = scrollTop;
    }

    hideSticky() {
        this.classList.remove('show-sticky', 'animate');
        this.closeDropdownPopupSticky();
    }

    showSticky() {
        this.classList.add('show-sticky', 'animate');
        this.closeDropdownPopupSticky();
    }

    closeModalClick() {
        this.closeMobileModal = this.querySelector('[data-sorting][data-mobile] .close-mobile-modal')
        this.closeMobileModal.addEventListener('click', () => {
            const dropdownButton = this.querySelector('[data-toggle][data-mobile="mobile"]')
            dropdownButton.setAttribute('aria-expanded', false); 
            document.body.classList.remove('toolbar-modal-open')
        })
    }

    closeDropdownPopupSticky(){
        if(this.querySelector('.label-tab')){
            this.querySelectorAll('.label-tab').forEach((element) => {
                element.setAttribute('aria-expanded', false);
            });
        }
    }   

    onBodyClickEvent(event){
        if(this.querySelector('[data-toggle]')){
            this.querySelectorAll('[data-toggle]').forEach((dropdownButton) => {
                if (dropdownButton.dataset.mobile === 'mobile') {
                    const contentDropdown = this.querySelector('[data-sorting][data-mobile]')
                    if ((!contentDropdown.contains(event.target)) && (!dropdownButton.contains(event.target))){
                        dropdownButton.setAttribute('aria-expanded', false);
                        if (document.body.classList.contains('toolbar-modal-open')) {
                            document.body.classList.remove('toolbar-modal-open')
                        }
                    }
                } else {
                    var contentDropdown = dropdownButton.nextElementSibling;
                    if ((!contentDropdown.contains(event.target)) && (!dropdownButton.contains(event.target))){
                        dropdownButton.setAttribute('aria-expanded', false);
                    }
                }
            });
        }
    }
}

customElements.define('toolbar-item', Toolbar);