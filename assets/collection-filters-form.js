class CollectionFiltersForm extends HTMLElement {
    constructor() {
        super();
        this.filterData = [];
        this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
        this.sidebarBlocks = this.querySelectorAll('.collection-filters__item [data-type-list]'); 
        
        const filterDisplayType = this.dataset.filterDisplay

        this.debouncedOnSubmit = debounce((event) => {
            this.onSubmitHandler(event);
        }, 500);

        this.debouncedOnClick = debounce((event) => {
            this.onClickHandler(event);
        }, 500);

        this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

        if(this.querySelector('#filter__price--apply')){
            this.querySelector('#filter__price--apply').addEventListener('click', this.debouncedOnClick.bind(this));
        }

        if ($('.facets-horizontal .js-filter[style="display: none;"]').length > 0) {
            $('.results-count .results').hide();
        } else {
            $('.results-count .results').show();
        }
      
        if (filterDisplayType === 'show-more') CollectionFiltersForm.initListShowMore(this.sidebarBlocks);
        
        sessionStorage.setItem('filterDisplayType', filterDisplayType)
        
        sessionStorage.setItem('productGridId', JSON.stringify(document.getElementById('main-collection-product-grid').dataset.id))

        CollectionFiltersForm.convertCurrency();
    }

    static initListShowMore(sidebarBlocks) {
        let storedExpandedAndCollapsedHeight = []
        sidebarBlocks.forEach((block, blockIndex) => {
            const facetList = block.querySelector('.facets__list');
            const facetListItems = facetList.querySelectorAll('.list-menu__item');
            const maxItemsNumber = parseInt(facetList.dataset.maxItems);
            let currentHeight = facetList.clientHeight;
            
            if (currentHeight === 0) {
                const contentWrapper = facetList.closest('.sidebarBlock-contentWrapper')
                contentWrapper.style.display = 'block'   
                currentHeight = facetList.clientHeight 
                contentWrapper.style.display = 'none'   
            }

            facetList.style.maxHeight = currentHeight + 'px';
            facetList.dataset.collapsedHeight = currentHeight;

            facetListItems.forEach((item, index) => {
                item.classList.remove('d-none');
                if (index + 1 > maxItemsNumber) item.style.opacity = '0';
            })

            storedExpandedAndCollapsedHeight.push({ index: block.dataset.index, collapsedHeight: currentHeight, extendedHeight: 0, showingMore: false })

            if (blockIndex === sidebarBlocks.length - 1) {
                sessionStorage.setItem('heightData', JSON.stringify(storedExpandedAndCollapsedHeight))
            }
        })

        const showMoreButtons = document.querySelectorAll('.show-more--list_tags');
        if(showMoreButtons) {
            showMoreButtons.forEach( (button) => button.addEventListener('click', CollectionFiltersForm.toggleShowMore));
        }
    }

    static toggleShowMore(event) {
        let storedExpandedAndCollapsedHeight = JSON.parse(sessionStorage.getItem('heightData')) || []

        const showMoreButton = event.target.closest('[data-show-more-btn]');
        const showMoreButtonContent = showMoreButton.querySelector('[data-show-more-content]')
        const sideBlock = event.target.closest('.sidebarBlock');
        const sideBlockContent = sideBlock.querySelector('.facets__list');
        const facetListItems = sideBlockContent.querySelectorAll('.facets__list .list-menu__item');
        const storedBlockData = storedExpandedAndCollapsedHeight.find(item => item.index === sideBlock.dataset.index)
        const collapsedHeight = parseInt(sideBlockContent.dataset.collapsedHeight) || storedBlockData.collapsedHeight;
        const maxItemsNumber = parseInt(sideBlockContent.dataset.maxItems);
        let maxExpandedHeight;
        if (maxItemsNumber <= 10) maxExpandedHeight = collapsedHeight * 3;
        if (maxItemsNumber > 10 && maxItemsNumber <= 20) maxExpandedHeight = collapsedHeight * 2;

        if (maxExpandedHeight > window.innerHeight) maxExpandedHeight = collapsedHeight * 1

        if (sideBlock.classList.contains('show-more')) {
            sideBlock.classList.remove('show-more');
            showMoreButtonContent.textContent = window.show_more_btn_text.show_all
            sideBlockContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
            sideBlockContent.style.maxHeight = collapsedHeight + 'px';
            facetListItems.forEach((item, index) => {
                if (index + 1 > maxItemsNumber) item.style.opacity = '0';
            }) 
            storedBlockData.showingMore = false
        } else {
            sideBlock.classList.add('show-more');
            sideBlockContent.style.maxHeight = maxExpandedHeight+ 'px';
            showMoreButtonContent.textContent = window.show_more_btn_text.show_less;
            facetListItems.forEach((item) => {
                item.style.opacity = '1';
            })
            storedBlockData.showingMore = true
        }
        storedBlockData.extendedHeight = maxExpandedHeight
        sessionStorage.setItem('heightData', JSON.stringify(storedExpandedAndCollapsedHeight))
    }

    static renderRemainingFilters(sidebarBlocks) {
        let storedExpandedAndCollapsedHeight = JSON.parse(sessionStorage.getItem('heightData')) || []
        
        sidebarBlocks.forEach((element) => {
            const htmlElement = document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`)
            htmlElement.innerHTML = element.innerHTML;

            const currentSideblockData = storedExpandedAndCollapsedHeight.find(item => item.index === element.dataset.index)
            const facetList = htmlElement.querySelector('.facets__list')
            const hiddenItems = facetList.querySelectorAll('.list-menu__item.d-none')
            const showMoreButton = htmlElement.querySelector('[data-show-more-btn]')
            const showMoreContent = showMoreButton?.querySelector('[data-show-more-content]')

            hiddenItems.forEach(item => item.classList.remove('d-none'))
            showMoreButton?.addEventListener('click', CollectionFiltersForm.toggleShowMore)
            facetList.dataset.collapsedHeight = currentSideblockData.collapsedHeight
            
            if (showMoreContent == null) return

            if (currentSideblockData.showingMore) {
                facetList.style.maxHeight = currentSideblockData.extendedHeight + 'px'
                htmlElement.classList.add('show-more')
                showMoreContent.textContent = window.show_more_btn_text.show_less
            } else {
                facetList.style.maxHeight = currentSideblockData.collapsedHeight + 'px'
                htmlElement.classList.remove('show-more')
                showMoreContent.textContent = window.show_more_btn_text.show_all
            }
        })  
    }

    static renderPriceFilter(priceFilterBlock) {
        if (priceFilterBlock) {
            const htmlElement = document.querySelector(`.js-filter[data-index="${priceFilterBlock.dataset.index}"]`)
            htmlElement.innerHTML = priceFilterBlock.innerHTML
            
            const debouncedOnClick = debounce((event) => {
                CollectionFiltersForm.handleClick(event);
            }, 500);    

            if (htmlElement.querySelector('#filter__price--apply')) {
                htmlElement.querySelector('#filter__price--apply').addEventListener('click', debouncedOnClick);
            }
        }
    }

    static setListeners() {
        const onHistoryChange = (event) => {
            const searchParams = event.state ? event.state.searchParams : CollectionFiltersForm.searchParamsInitial;
            if (searchParams === CollectionFiltersForm.searchParamsPrev) return;
            CollectionFiltersForm.renderPage(searchParams, null, false);
        }

        window.addEventListener('popstate', onHistoryChange);
    }

    static toggleActiveFacets(disable = true) {
        document.querySelectorAll('.js-facet-remove').forEach((element) => {
            element.classList.toggle('disabled', disable);
        });
    }

    static resizeGridItem(item) {
        grid = document.getElementsByClassName('halo-row--masonry')[0];

        rowHeight = parseInt(
            window.getComputedStyle(grid).getPropertyValue('grid-auto-rows')
        );

        rowGap = parseInt(
            window.getComputedStyle(grid).getPropertyValue('grid-row-gap')
        );

        rowSpan = Math.ceil(
            (item.querySelector('.collection-masonry .product-masonry-item .product-item').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)
        );

        item.style.gridRowEnd = 'span ' + rowSpan;
    }

    static resizeAllGridItems() {
        
        allItems = document.getElementsByClassName('product-masonry-item');

        for (x = 0; x < allItems.length; x++) {
            this.resizeGridItem(allItems[x]);
        }
    }

    static renderPage(searchParams, event, updateURLHash = true) {
        CollectionFiltersForm.searchParamsPrev = searchParams;

        const sections = CollectionFiltersForm.getSections();

        // document.getElementById('CollectionProductGrid').querySelector('.collection').classList.add('is-loading');
        document.body.classList.add('has-halo-loader');
        
        sections.forEach((section) => {
            const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
            const filterDataUrl = element => element.url === url;

            CollectionFiltersForm.filterData.some(filterDataUrl) ?
            CollectionFiltersForm.renderSectionFromCache(filterDataUrl, section, event) :
            CollectionFiltersForm.renderSectionFromFetch(url, section, event);
        });

        if (updateURLHash) CollectionFiltersForm.updateURLHash(searchParams);
    }

    static renderSectionFromFetch(url, section, event) {
        fetch(url)
        .then(response => response.text())
        .then((responseText) => {
            const html = responseText;
            CollectionFiltersForm.filterData = [...CollectionFiltersForm.filterData, { html, url }];
            CollectionFiltersForm.renderFilters(html, event);
            CollectionFiltersForm.renderProductGrid(html);
        });

    }

    static renderSectionFromCache(filterDataUrl, section, event) {
        const html = this.filterData.find(filterDataUrl).html;
        this.renderFilters(html, event);
        this.renderProductGrid(html);
    }

    static setProductForWishlist(handle){
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

    static setLocalStorageProductForWishlist() {
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

    static setLocalStorageProductForCompare($link) {
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

    static renderProductGrid(html) {
        const innerHTML = new DOMParser()
            .parseFromString(html, 'text/html')
            .getElementById('CollectionProductGrid')
            .querySelector('.collection')?.innerHTML;

        document.getElementById('CollectionProductGrid').querySelector('.collection').innerHTML = innerHTML;

        const resultsCount = new DOMParser()
            .parseFromString(html, 'text/html')
            .getElementById('CollectionProductGrid')
            .querySelector('.results-count .count')?.innerHTML;

        if ($('.facets-horizontal .js-filter[style="display: none;"]').length > 0) {
            $('.results-count .results').hide();
        } else {
            $('.results-count .results').show();
            $('.results-count .count').text(resultsCount);
        }

        if ($('.toolbar').length > 0) {
            this.setActiveViewModeMediaQuery(true);
        }

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
        
        if (document.querySelector('.collection-masonry')) {
            document.getElementById('CollectionProductGrid').querySelector('.collection .halo-row--masonry').classList.add('is-show');
            CollectionFiltersForm.resizeAllGridItems();
        }

        if (this.checkNeedToConvertCurrency()) {
            Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
        }
    }

    static checkNeedToConvertCurrency() {
        var currencyItem = $('.dropdown-item[data-currency]');
        if (currencyItem.length) {
            return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
        } else {
            return;
        }
    }

    static convertCurrency() {
        if (this.checkNeedToConvertCurrency()) {
            let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
            Currency.convertAll(window.shop_currency, currencyCode, '.format-money-input', 'money_format');
        }
    }

    static renderFilters(html, event) {
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

        const facetDetailsElements = parsedHTML.querySelectorAll('#CollectionFiltersForm .js-filter');
        const indexTarget = event?.target.closest('.js-filter')?.dataset.index;
        const matchesIndex = (element) => element.dataset.index === indexTarget;
        const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
        const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);
        
        facetsToRender.forEach((element) => {
            document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
        });
        if (document.querySelector(`.facets__reset[data-index="${indexTarget}"]`)) {
            document.querySelector(`.facets__reset[data-index="${indexTarget}"]`).style.display = 'block';
        }

        CollectionFiltersForm.renderActiveFacets(parsedHTML);

        if (countsToRender) CollectionFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));

        if (sessionStorage.getItem('filterDisplayType') === 'show-more') {
            const remainingSidebarBlocks = Array.from(facetDetailsElements).filter(element => element.dataset.typeList && element.dataset.index !== indexTarget)
            CollectionFiltersForm.renderRemainingFilters(remainingSidebarBlocks)
        }
        
        CollectionFiltersForm.renderPriceFilter(Array.from(facetDetailsElements).find(element => element.dataset.typePrice && element.dataset.index !== indexTarget))
    }

    static handleClick(event) {
        event.preventDefault();

        const form = event.target.closest('form');
        const inputs = form.querySelectorAll('input[type="number"]');
        const minInput = inputs[0];
        const maxInput = inputs[1];

        if (maxInput.value) minInput.setAttribute('max', maxInput.value);
        if (minInput.value) maxInput.setAttribute('min', minInput.value);

        if (minInput.value === '') {
            maxInput.setAttribute('min', 0);
            minInput.value = Number(minInput.getAttribute('min'));
        }

        if (maxInput.value === '') {
            minInput.setAttribute('max', maxInput.getAttribute('max'));
            maxInput.value = Number(maxInput.getAttribute('max'));
        }

        const formData = new FormData(form);
        const searchParams = new URLSearchParams(formData).toString();

        CollectionFiltersForm.renderPage(searchParams, event);
    }

    static renderActiveFacets(html) {
        const activeFacetElementSelectors = ['.refined-widgets'];

        activeFacetElementSelectors.forEach((selector) => {
            const activeFacetsElement = html.querySelector(selector);
            if (!activeFacetsElement) return;
            
            var refineBlock =  document.querySelector(selector);
            refineBlock = activeFacetsElement.innerHTML;
            
            if(document.querySelector(selector).querySelector('li')){
                document.querySelector(selector).style.display = "block";
            } else {
                document.querySelector(selector).style.display = "none";
            }
        });

        CollectionFiltersForm.toggleActiveFacets(false);

        setTimeout(() => {
            const sidebarBlocks = html.querySelectorAll('.collection-filters__item [data-type-list]'); 
            // CollectionFiltersForm.initListShowMore();
        }, 500)
    }

    static renderCounts(source, target) {
        const countElementSelectors = ['.facets__count'];
        countElementSelectors.forEach((selector) => {
            const targetElement = target.querySelector(selector);
            const sourceElement = source.querySelector(selector);

            if (sourceElement && targetElement) {
                target.querySelector(selector).outerHTML = source.querySelector(selector).outerHTML;
            }
        });
    }

    static updateURLHash(searchParams) {
        history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
    }
    

    static getSections() {
        return [{
            id: 'main-collection-product-grid',
            section: document.getElementById('main-collection-product-grid')?.dataset.id || JSON.parse(sessionStorage.getItem("productGridId")),
        }]
    }

    static setActiveViewModeMediaQuery(ajaxLoading = true){
        var mediaView = document.querySelector('[data-view-as]'),
            mediaViewMobile = document.querySelector('[data-view-as-mobile]'),
            viewMode = mediaView?.querySelector('.icon-mode.active'),
            viewModeMobile = mediaViewMobile?.querySelector('.icon-mode.active'),
            column = parseInt(viewMode?.dataset.col),
            windowWidth = window.innerWidth;

        if (!mediaView || !mediaViewMobile) return

        if(column != 1){
            if(document.querySelector('.sidebar--layout_vertical')){
                if (windowWidth < 768) {
                    if (column == 3 || column == 4 || column == 5) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-2').classList.add('active');
                        mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth <= 1100 && windowWidth >= 768) {
                    if (column == 5 || column == 4 || column == 3) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-2').classList.add('active');
                        mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth < 1599 && windowWidth > 1100) {
                    if (column == 5 || column == 4) {
                        column = 3;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-3').classList.add('active');
                        mediaViewMobile.querySelector('.grid-3').classList.add('active');
                    }
                } else if (windowWidth < 1700 && windowWidth >= 1599) {
                    if (column == 5) {
                        column = 4;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-4').classList.add('active');
                        mediaViewMobile.querySelector('.grid-4').classList.add('active');
                    }
                }
            } else{
                if (windowWidth < 768) {
                    if (column == 3 || column == 4 || column == 5) {
                        column = 2;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-2').classList.add('active');
                        mediaViewMobile.querySelector('.grid-2').classList.add('active');
                    }
                } else if (windowWidth < 992 && windowWidth >= 768) {
                    if (column == 4 || column == 5) {
                        column = 3;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-3').classList.add('active');
                        mediaViewMobile.querySelector('.grid-3').classList.add('active');
                    }
                } else if (windowWidth < 1600 && windowWidth >= 992) {
                    if (column == 5) {
                        column = 4;
                        viewMode.classList.remove('active');
                        viewModeMobile.classList.remove('active');
                        mediaView.querySelector('.grid-4').classList.add('active');
                        mediaViewMobile.querySelector('.grid-4').classList.add('active');
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

    static initViewModeLayout(column) {
        const productListing = document.getElementById('CollectionProductGrid').querySelector('.productListing');

        if (!productListing) return;

        switch (column) {
            case 1:
                productListing.classList.remove('productGrid', 'column-5', 'column-4', 'column-3', 'column-2');
                productListing.classList.add('productList');

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
    }

    onClickHandler(event) {
        event.preventDefault();

        const form = event.target.closest('form');
        const inputs = form.querySelectorAll('input[type="number"]');
        const minInput = inputs[0];
        const maxInput = inputs[1];

        if (maxInput.value) minInput.setAttribute('max', maxInput.value);
        if (minInput.value) maxInput.setAttribute('min', minInput.value);

        if (minInput.value === '') {
            maxInput.setAttribute('min', 0);
            minInput.value = Number(minInput.getAttribute('min'));
        }

        if (maxInput.value === '') {
            minInput.setAttribute('max', maxInput.getAttribute('max'));
            maxInput.value = Number(maxInput.getAttribute('max'));
        }

        const formData = new FormData(form);
        let searchParams = new URLSearchParams(formData).toString();
        searchParams = this.onConvertPrice(searchParams);
        CollectionFiltersForm.renderPage(searchParams, event);
    }

    onSubmitHandler(event) {
        event.preventDefault();
        if(!event.target.classList.contains('filter__price')){
            const formData = new FormData(event.target.closest('form'));
            let searchParams = new URLSearchParams(formData).toString();
            searchParams = this.onConvertPrice(searchParams);
            CollectionFiltersForm.renderPage(searchParams, event);
        }
    }

    onSubmitHandlerFromSortBy(event, form){
        event.preventDefault();

        if(!event.target.classList.contains('filter__price')){
            const formData = new FormData(form);
            const searchParams = new URLSearchParams(formData).toString();
            CollectionFiltersForm.renderPage(searchParams, event);
        }
    }

    onActiveFilterClick(event) {
        event.preventDefault();
        CollectionFiltersForm.toggleActiveFacets();
        const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
        CollectionFiltersForm.renderPage(url);
    }

    onConvertPrice(searchParams) {
        const moneyMax = this.querySelector('.money--max');

        if (moneyMax) {
            const $searchParams = searchParams.split('&');
            const currentMax = Number(moneyMax.dataset.currentMax);
            const defaultMax = Number(moneyMax.dataset.defaultMax);
            let ratio = 1, params = '';

            if (currentMax != defaultMax && !isNaN(currentMax) && !isNaN(defaultMax)) {
                ratio = defaultMax/currentMax;

                $searchParams.forEach(element => {
                    const attr = element.split('=')[0];
                    const val = element.split('=')[1];
                    switch(attr) {
                        case 'filter.v.price.gte':
                            let min = Math.round(val*ratio);
                            params == '' ? params = `filter.v.price.gte=${min}` : params = `${params}&filter.v.price.gte=${min}`;
                            break;
                        case 'filter.v.price.lte':
                            let max = Math.round(val*ratio);
                            params == '' ? params = `filter.v.price.lte=${max}` : params = `${params}&filter.v.price.lte=${max}`;
                            break;
                        default:
                            params == '' ? params = element : params = `${params}&${element}`;
                    }
                });

                searchParams = params;
            }
        }

        return searchParams;
    }
}

CollectionFiltersForm.filterData = [];
CollectionFiltersForm.searchParamsInitial = window.location.search.slice(1);
CollectionFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('collection-filters-form', CollectionFiltersForm);
CollectionFiltersForm.setListeners();

class PriceRange extends HTMLElement {
    constructor() {
        super();
        this.rangeSliderPrice();
        this.querySelectorAll('input').forEach((element) => {
            element.addEventListener('change', this.onRangeChange.bind(this))
        });
        this.setMinAndMaxValues();
        const numberS = this.querySelectorAll("input[type=number]");
        let value1 = numberS[0].value;
        let value2 = numberS[1].value ;

        this.updateDisplay(value1, value2);
    }       

    onRangeChange(event) {
        this.adjustToValidValues(event.currentTarget);
        this.setMinAndMaxValues();
    }

    setMinAndMaxValues() {
        const inputs = this.querySelectorAll('input');
        const minInput = inputs[0];
        const maxInput = inputs[1];

        // if (maxInput.value) minInput.setAttribute('max', maxInput.value);
        // if (minInput.value) maxInput.setAttribute('min', minInput.value);
        if (minInput.value === '') maxInput.setAttribute('min', 0);
        if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
    }

    adjustToValidValues(input) {
        const value = Number(input.value);
        const min = Number(input.getAttribute('min'));
        const max = Number(input.getAttribute('max'));

        if (value < min) input.value = min;
        if (value > max) input.value = max;
    }

    rangeSliderPrice(){
        var rangeS = this.querySelectorAll("input[type=range]"),
            numberS = this.querySelectorAll("input[type=number]");
        
        rangeS.forEach((element) => {
            element.oninput = () => {
                var slide1 = parseFloat(rangeS[0].value),
                    slide2 = parseFloat(rangeS[1].value);

                if (slide1 > slide2) {
                    [slide1, slide2] = [slide2, slide1];
                }

                numberS[0].value = slide1;
                numberS[1].value = slide2;
                this.updateDisplay(numberS[0].value, numberS[1].value);
                this.updatePrice(slide1, slide2);
            }
        });

        numberS.forEach((element) => {
            element.oninput = () => {
                var number1 = parseFloat(numberS[0].value),
                    checkValue1 = number1 != number1,
                    number2 = parseFloat(numberS[1].value),
                    checkValue2 = number2 != number2;

                if(!checkValue1){
                    rangeS[0].value = number1;
                }

                if(!checkValue2){
                    rangeS[1].value = number2;
                }   

                if (number1 > number2) {
                    this.updateDisplay(number2, number1);
                    this.updatePrice(number2, number1);
                } else {
                    this.updateDisplay(number1, number2);
                    this.updatePrice(number1, number2);
                }
            }
        });
    }

    updateDisplay(value1, value2) {
        const range = this.querySelector("input[type=range]");
        const priceSlideRangeContainer = this.querySelector('.facets__price--slide');
        const max = range.max 
        const width = priceSlideRangeContainer.clientWidth;

        const leftSpace = (parseInt(value1) / parseInt(max)) * width + 'px'
        const rightSpace = (width - (parseInt(value2) / parseInt(max)) * width) + 'px'

        priceSlideRangeContainer.style.setProperty('--left-space', leftSpace)
        priceSlideRangeContainer.style.setProperty('--right-space', rightSpace)
    }

    updatePrice(min, max) {
        const $currentMin = document.querySelector('.money--current-min');
        const $currentMax = document.querySelector('.money--current-max');

        if ($currentMin) $currentMin.innerHTML = min;
        if ($currentMax) $currentMax.innerHTML = max;
    }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
    constructor() {
        super();
        this.querySelector('a').addEventListener('click', (event) => {
            event.preventDefault();
            const form = this.closest('collection-filters-form') || document.querySelector('collection-filters-form');
            form.onActiveFilterClick(event);
        });
    }
}

customElements.define('facet-remove', FacetRemove);
