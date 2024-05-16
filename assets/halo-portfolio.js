class Portfolio extends HTMLElement {
	constructor() {
		super();

		this.Shuffle = window.Shuffle;
		this.element = this.querySelector('.shuffle-container');
		this.sizer = this.querySelector('.sizer-element');
		this.tabs = document.getElementById('haloPortfolioTabs');
		this.tabContents = document.getElementById('haloPortfolioTabContents');
		this.masonryItems = [...document.querySelectorAll('.masonry-item')]
		this.imageBoxElements = this.querySelectorAll('.img-box')
		this.showMorebtn = this.querySelector('#portfolio-showmore-btn')
		this.limit = parseInt(this.tabContents.dataset.limit)
		this.itemNumberToShow = this.limit
		this.infiniteEnabled = this.tabContents.dataset.infinite === 'true' 

		this.shuffleInstance = new this.Shuffle(this.element, {
			itemSelector: '.masonry-item',
			sizer: this.sizer,
			percentPosition: true
		});

		if (this.tabs) {
			//creating the tabs and add Click Tab Event Listeners
			const galleryNames = this.tabs.dataset.galleryNames.split(',')
			const processedGalleryNames = new Set(galleryNames)
			processedGalleryNames.forEach(rawGalleryName => {
				const galleryName = rawGalleryName.slice(0, -1)
				const tabElement = document.createElement('li')
				tabElement.classList.add('tab')
				tabElement.dataset.gallery = galleryName.toLowerCase()

				const a = document.createElement('a')
				a.classList.add('tab-title')
				a.innerText = galleryName
				a.href = '#'
				a.role = 'button'
				a.title = galleryName
				tabElement.appendChild(a)
				this.tabs.appendChild(tabElement)
			})

			if (this.tabs.querySelector('a')) {
				this.tabs.querySelectorAll('a').forEach((tabButton) => {
					tabButton.addEventListener('click', this.onClickTabButtonHandler.bind(this));
				});
			}
		}

		if (this.imageBoxElements) {
			this.imageBoxElements.forEach(imageBox => {
				imageBox.addEventListener('click', this.handleThumbnailClick)
			})
		}

		// initialize the thumbnail to be shown within limit if infinite scrolling is enabled
		if (this.infiniteEnabled) {
			this.masonryItems.forEach((item, index) => {
				if (index < this.limit ) {
					item.classList.add('d-block')
				} else {
					item.classList.add('d-none')
				}
			})
		} 

		if (this.showMorebtn) {
			if (this.masonryItems?.length - 1 <= this.limit ) return this.showMorebtn.classList.add('disabled')
			this.showMorebtn.addEventListener('click', this.handleShowMoreClick.bind(this))
		}

		checkButtonSpacingTopPortfolio2(this.masonryItems, this.showMorebtn)
	}

	onClickTabButtonHandler(event) {
		event.preventDefault();
		event.stopPropagation();

		const btn = event.currentTarget
		const tab = event.target.closest('li')
		const value = tab.getAttribute('data-gallery')
		
		if (!tab.classList.contains('is-active')) {
			this.tabs.querySelectorAll('li').forEach((element) => {
				element.classList.remove('is-active');
			});
			tab.classList.add('is-active');
			this.filterSelection(value);
		}
	}

	filterSelection(keyword){
		const items = $('[data-gallery-tab-content] .masonry-item');

		if (keyword == 'all'){
			this.shuffleInstance.filter();
			if (this.infiniteEnabled) {
				// reinitialize the infinite scrolling feature when select the 'all' tab
				showElement(this.showMorebtn)
				this.itemNumberToShow = this.masonryItems.filter(item => item.classList.contains('d-block')).length - 1
				this.itemNumberToShow += this.limit
				checkAvailableItemsToShow(this.masonryItems, this.itemNumberToShow, this.showMorebtn)
			}
		} else {
			if (this.infiniteEnabled) {
				// disable infinite feature when select a tab
				const itemsToShow = this.tabContents.querySelectorAll(`[data-gallery-item="${keyword}"]`)
				itemsToShow.forEach(item => {
					item.classList.remove('d-none')
					item.classList.add('d-block')
				})
				hideElement(this.showMorebtn)
			}
			this.shuffleInstance.filter((element) => {
				const filterValue = element.getAttribute('data-gallery-item');
				if(filterValue !== undefined && filterValue !== null){
						return $(element).data('gallery-item').indexOf(keyword) != -1;
				}
			});
		}
	}

	handleThumbnailClick(e) {
		e.preventDefault()
		e.stopPropagation()

		const imageBoxElement = e.target.closest('.img-box')
		const action = imageBoxElement.dataset.action

		if (action === 'to_link') {
			const url = imageBoxElement.dataset.link
			return window.location.href = url
		}

		const dataHREF = imageBoxElement.dataset.href

		if (dataHREF) {
			const hrefArray = dataHREF.split(',');
			const fancyObj = hrefArray.map((href, index) => {
				return ({
					src  : href,
					opts : {
						caption : `${index + 1} of ${hrefArray.length}`
					}
				})
			});
			$.fancybox.open(fancyObj, {
				loop : true,
				thumbs : {
					autoStart : false
				},
				slideClass: "portfolio",
				buttons: [
				],
				clickSlide: "close",
				mobile: {
					clickSlide: function(current, event) {
						return "close";
					}
				},
				afterLoad: function(instance, slide){
					// move caption into image box
					instance.$caption.appendTo('.fancybox-image-wrap').text(instance.$caption.text());
					// create close icon
					$('.fancybox-image-wrap').append('<div class="close-box"></div>')
					// close fancybox
					$('.close-box').on('click touchend' ,function(){
						instance.close();
					})
				}
			});
		}
	}

	handleShowMoreClick() {
		this.itemNumberToShow += this.limit

		this.showMorebtn.classList.add('is-loading')
		setTimeout(() => {
			setMasonryItems(this.masonryItems, this.itemNumberToShow)

			// reinitialize the masonry whenever new items are visible
			this.shuffleInstance = new this.Shuffle(this.element, {
				itemSelector: '.masonry-item',
				sizer: this.sizer,
				percentPosition: true,
				columnWidth: '.sizer-element'
			});

			// Checking: 'show more' button will be disabled when no more items are available
			checkAvailableItemsToShow(this.masonryItems, this.itemNumberToShow, this.showMorebtn)
			checkButtonSpacingTopPortfolio2(this.masonryItems, this.showMorebtn)
			this.showMorebtn.classList.remove('is-loading')
		}, 700)	
	}
}

customElements.define('portfolio-item', Portfolio);

function hideElement(element) {
	element.style.display = 'none'
}

function showElement(element) {
	element.style.display = 'inline-block'
}

function checkAvailableItemsToShow(elements, limit, button) {
	const totalShownElementsCount = elements.filter(element => element.classList.contains('d-block') && !element.classList.contains('sizer-element')).length
	if (totalShownElementsCount == (elements.length - 1) && totalShownElementsCount <= limit) return button.classList.add('disabled')
	button.classList.remove('disabled')
}

function checkButtonSpacingTopPortfolio2(elements, button) {
	const shownNumber = elements.filter(element => element.classList.contains('d-block') && !element.classList.contains('sizer-element')).length
	if (shownNumber % 2 === 0) return button.classList.remove('extra-spaced')
	button.classList.add('extra-spaced')
} 

function setMasonryItems(items, itemsToShow) {
	items.forEach((item, index) => {
		// remove all display styles from all masonry items
		if (index >= itemsToShow) {
			item.classList.add('d-none')
		} else {
			item.classList.add('d-block')
		}

		// check to always show the sizer element in masonry grid
		if (index + 1 === items.length) {
			item.classList.remove('d-none')
			item.classList.add('d-block')
		}
	})
}