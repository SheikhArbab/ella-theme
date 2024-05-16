class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.trendingAndProductsBlock = this.querySelector('[data-quick-trending-products]');
    this.closeStickySearchButton = document.querySelector('.header-search-close');
    this.productToShow = this.dataset.productToShow;
    this.searchDetails = this.querySelector('.search_details');
    this.predictiveSearch = this.querySelector('predictive-search')
    this.isOpen = false;

    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const form = this.querySelector('form.search');
    form.addEventListener('submit', this.onFormSubmit.bind(this));
    
    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 500).bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
    document.addEventListener('click', this.onDocClick.bind(this));
    if (this.closeStickySearchButton != null) {
      this.closeStickySearchButton.addEventListener('click', this.onCloseStickySearchClick.bind(this));
    }
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();
    
    if (!searchTerm.length) {
      this.close(true);
      return;
    }
    
    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();
    
    if (!searchTerm.length) return this.showTrendingAndProducts();

    if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) {
        this.close();
        // this.hideTrendingAndProducts();
      };
    })
  }
  
  onKeyup(event) {
    if (!this.getQuery().length) {
      this.close(true);
      this.showTrendingAndProducts();
    };
    event.preventDefault();
    
    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('li');
    let activeElement = this.querySelector('li');

    if (moveUp && !selectedElement) return;

    this.statusElement.textContent = '';
    
    if (!moveUp && selectedElement) {
      activeElement = selectedElement.nextElementSibling || allElements[0];
    } else if (moveUp) {
      activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.setLiveRegionText(activeElement.textContent);
    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }
    
  selectOption() {
    const selectedProduct = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');

    if (selectedProduct) selectedProduct.click();
  }
  
  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();
    
    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      this.updateViewAllLink(searchTerm);
      return;
    }

    fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product&${encodeURIComponent('resources[limit]')}=${this.productToShow}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        
        return response.text();
      })  
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        this.cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
        this.updateViewAllLink(searchTerm);
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }
  
  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');
    
    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;
    
    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', true);
    this.setAttribute('open', true);
    this.setLiveRegionResults();
    this.open();
    this.hideTrendingAndProducts();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }
  
  getResultsMaxHeight() {
    this.resultsMaxHeight = window.innerHeight - document.querySelector('[class^="header-navigation"]').getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }
  
  open() {
    //this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }
    
    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false;
    this.predictiveSearchResults.removeAttribute('style');

    this.isOpen = false;
  }

  showTrendingAndProducts() {
    if (!this.trendingAndProductsBlock) return 
    this.trendingAndProductsBlock.classList.add('is-show')
    this.trendingAndProductsBlock.classList.remove('hidden');
  }

  hideTrendingAndProducts() {
    if (!this.trendingAndProductsBlock) return 

    this.trendingAndProductsBlock.classList.remove('is-show')
    this.trendingAndProductsBlock.classList.add('hidden');
  }

  onDocClick(e) {
    const isInModal = this.contains(e.target), $target = e.target

    if (!isInModal || $target.closest('.header-search-popup-close') || $target.matches('.header-search-popup-close') || $target.closest('.header-search-close') || $target.matches('.header-search-close')) {
      this.close();
      this.hideTrendingAndProducts();
    }
  }

  onCloseStickySearchClick() {
    this.close();
    this.hideTrendingAndProducts();
    document.querySelector('body').classList.remove('sticky-search-open');
    document.querySelector('body').classList.remove('sticky-search-menu-open');
    this.closest('[class*="section-header-"]')?.classList.remove('sticky-search-menu-open')
    this.closest('[class*="section-header-"]')?.classList.remove('sticky-search-menu-custom-open')
  }

  updateViewAllLink(searchTerm) {
    const qsViewAllLink = document.querySelector('[data-qs-view-all-link]');
    if (!qsViewAllLink) return 

    const linkTotal = `${routes.search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product`
    
    qsViewAllLink.href = linkTotal
    return this.getTotalResults(linkTotal).then(count => {
      qsViewAllLink.innerHTML = qsViewAllLink.innerHTML.replace('()', `(${count})`)
    });
  }

  getTotalResults(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })  
      .then((text) => {
        const totalCount = new DOMParser().parseFromString(text, 'text/html').querySelector('[id^="SearchSection"]').dataset.searchCount;
        return totalCount
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }
}

customElements.define('predictive-search', PredictiveSearch);
