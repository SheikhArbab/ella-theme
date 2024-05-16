class SliderComponent extends HTMLElement {
    constructor() {
        super();
        this.slider = this.querySelector('ul');
        this.sliderItems = this.querySelectorAll('li');
        this.pageCount = this.querySelector('.slider-counter--current');
        this.pageTotal = this.querySelector('.slider-counter--total');
        this.prevButton = this.querySelector('button[name="previous"]');
        this.nextButton = this.querySelector('button[name="next"]');
        this.dotButton = this.querySelectorAll('button[name="dots"]');
        this.rtl_num = document.body.classList.contains('layout_rtl') ? -1 : 1;
            
        if (!this.slider || !this.nextButton) return;

        const resizeObserver = new ResizeObserver(entries => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('scroll', this.update.bind(this));
        this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
        this.dotButton.forEach((button) => {
            button.addEventListener('click', this.onDotClick.bind(this));
        });
    }   

    initPages() {
        if (this.sliderItems.length === 0) return;
        this.slidesPerPage = Math.floor(this.slider.clientWidth / this.sliderItems[0].clientWidth);
        this.totalPages = this.sliderItems.length - this.slidesPerPage + 1;
        if (this.pageCount) this.pageCount.innerText = this.slidesPerPage;
    }   

    update() {
        this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItems[0].clientWidth * this.rtl_num);
        this.querySelector('.dots-item.active')?.classList.remove('active');
        this.querySelectorAll('.dots-item')[this.currentPage]?.classList.add('active');
        if (this.pageCount) this.pageCount.innerText = this.slidesPerPage + this.currentPage;
    }

    onButtonClick(event) {
        event.preventDefault();
        const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderItems[0].clientWidth * this.rtl_num : this.slider.scrollLeft - this.sliderItems[0].clientWidth * this.rtl_num;
        this.slider.scrollTo({
            left: slideScrollPosition
        });
    }

    onDotClick(event) {
        event.preventDefault();
        this.dotActive = this.querySelector('.dots-item.active button');
        const sliderItemActive = this.dotActive.dataset.index;
        const sliderItem = event.currentTarget.dataset.index;
        const sliderCount = sliderItem > sliderItemActive ? sliderItem - sliderItemActive : sliderItemActive - sliderItem;
        this.querySelector('.dots-item.active').classList.remove('active');
        event.currentTarget.closest('.dots-item').classList.add('active');

        const slideScrollPosition = sliderItem * this.sliderItems[0].clientWidth;

        this.slider.scrollTo({
            left: slideScrollPosition
        });
    }
}

customElements.define('slider-component', SliderComponent);

class ProductSliderComponent extends SliderComponent {
    constructor() {
        super();
        this.slider = this.querySelector('.slider');
        this.sliderItems = this.querySelectorAll('.slider__slide');
        if (this.sliderItems.length === 0) this.sliderItems = this.querySelectorAll('.slider div.product');
        if (!this.slider || !this.nextButton) return;

        const resizeObserver = new ResizeObserver(entries => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('DOMSubtreeModified', () => {
            this.slider = this.querySelector('.slider');
            this.sliderItems = this.querySelectorAll('.slider__slide').length ? this.querySelectorAll('.slider__slide') : this.querySelectorAll('.slider div.product');
            this.slider.addEventListener('scroll', this.update.bind(this));
            this.prevButton?.addEventListener('click', this.onButtonClick.bind(this));
            this.nextButton?.addEventListener('click', this.onButtonClick.bind(this));
            this.dotButton.forEach((button) => {
                button.addEventListener('click', this.onDotClick.bind(this));
            });
        });

        this.slider.addEventListener('scroll', this.update.bind(this));
        this.prevButton?.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton?.addEventListener('click', this.onButtonClick.bind(this));
        this.dotButton.forEach((button) => {
            button.addEventListener('click', this.onDotClick.bind(this));
        });
    }
}

class BannerSliderComponent extends SliderComponent {
    constructor() {
        super();
        this.slider = this.querySelector('.slider');
        this.sliderItems = this.querySelectorAll('.slider__slide');

        if (!this.slider || !this.dotButton) return;

        const resizeObserver = new ResizeObserver(entries => this.initPages());
        resizeObserver.observe(this.slider);

        this.slider.addEventListener('DOMSubtreeModified', () => {
            this.slider = this.querySelector('.slider');
            this.sliderItems = this.querySelectorAll('.slider__slide');
            this.slider.addEventListener('scroll', this.update.bind(this));
            this.prevButton?.addEventListener('click', this.onButtonClick.bind(this));
            this.nextButton?.addEventListener('click', this.onButtonClick.bind(this));
            this.dotButton.forEach((button) => {
                button.addEventListener('click', this.onDotClick.bind(this));
            });
        });
        
        this.slider.addEventListener('scroll', this.update.bind(this));
        this.prevButton?.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton?.addEventListener('click', this.onButtonClick.bind(this));
        this.dotButton.forEach((button) => {
            button.addEventListener('click', this.onDotClick.bind(this));
        });
        this.initButtonDisable();
    }
    
    initButtonDisable() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('first-item')) {
                        this.prevButton?.classList.add('disabled')    
                    } else if (entry.target.classList.contains('last-item')) {
                        this.nextButton?.classList.add('disabled')    
                    }
                } else {
                    if (entry.target.classList.contains('first-item')) {
                        this.prevButton?.classList.remove('disabled')   
                    } else if (entry.target.classList.contains('last-item')) {
                        this.nextButton?.classList.remove('disabled')   
                    }
                }
            })
        }, {
            threshold: 0.8,
            root: this.slider 
        })

        this.sliderItems[0].classList.add('first-item')
        this.sliderItems[this.sliderItems.length - 1].classList.add('last-item')

        observer.observe(this.sliderItems[0])
        observer.observe(this.sliderItems[this.sliderItems.length - 1])
    }
}

class TiktokSliderComponent extends BannerSliderComponent {
    constructor() {
        super();

        this.sliderActionsAndPageCount = this.querySelector('.slider-buttons');
    }

    initPages() {
        if (this.sliderItems.length === 0) return;
        const distance = this.slider.clientWidth / this.sliderItems[0].clientWidth;

        this.slidesPerPage = distance % 1 > 0.5 ? Math.ceil(distance) : Math.floor(distance);
        this.totalPages = Math.ceil(this.sliderItems.length - this.slidesPerPage) + 1;

        if (this.pageTotal && this.dataset.tiktokSlider === 'true') {
            this.pageTotal.innerText = this.totalPages;
        }   

        if (this.totalPages <= 1 || window.innerWidth >= 1025) {
            this.sliderActionsAndPageCount.style.display = 'none';
        } else if (this.totalPages > 1) this.sliderActionsAndPageCount.style.display = 'flex';
    }   
}

window.addEventListener('load', () => {
    customElements.define('banner-slider-component', BannerSliderComponent);
    customElements.define('product-slider-component', ProductSliderComponent);
    customElements.define('tiktok-slider-component', TiktokSliderComponent);
})
