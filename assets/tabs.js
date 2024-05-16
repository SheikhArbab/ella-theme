class ProductTabs extends HTMLElement {
    constructor() {
        super();
        
        this.tab = this.querySelectorAll('.tab-title');
        this.tabContents = this.querySelector('.tabs-contents');
        this.tabContent = this.querySelectorAll('.tab-content');
        this.link = this.querySelectorAll('.toggleLink');
        this.readMore = this.querySelectorAll('[data-show-more-toogle]');
        this.tabClose = this.querySelectorAll('.pdViewTab-close');
        this.isVerticalPopup = this.dataset.vertical === 'sidebar'
        this.isVerticalSidebarMobile = this.dataset.verticalMobile === 'sidebar-mobile'

        for (let i = 0; i < this.tab.length; i++) {
            this.tab[i].addEventListener(
                'click',
                this.tabActive.bind(this)
            );
        }
            
        for (let i = 0; i < this.link.length; i++) {
            this.link[i].addEventListener(
                'click',
                this.tabToggle.bind(this)
            );
        }

        document.addEventListener('click', e => {
            if (e.target.matches('[data-show-more-toogle]') || e.target.closest('[data-show-more-toogle]')) {
                this.readMoreReadLess(e)
            }
            else if (e.target.matches('.pdViewTab-close') || e.target.closest('.pdViewTab-close')) {
                this.productTabClose(e)

                if (this.isVerticalPopup || this.isVerticalSidebarMobile) {
                    this.handleVerticalPopupClose(e)
                }
            }
        });

        if (this.isVerticalPopup || this.isVerticalSidebarMobile) {
            document.querySelector('.background-overlay').addEventListener('click', this.onBackgroundClick.bind(this));
        }
    }

    tabActive(event){
        event.preventDefault();
        event.stopPropagation();

        var $this = event.target,
            id = $this.getAttribute('href').replace('#', ''),
            button_tab = document.querySelector('.an-horizontal-shaking');

        if(!$this.classList.contains('is-open')) {
            this.tab.forEach((element, index) => {
                element.classList.remove('is-open');
            });

            $this.classList.add('is-open');
            this.tabContents.classList.add('is-show');
            button_tab?.classList.add('open-tab-content');

            this.tabContent.forEach((element, index) => {
                if(element.getAttribute('id') == id){
                    element.classList.add('is-active');
                } else {
                    element.classList.remove('is-active');
                }
            });
        }   

        if($this.classList.contains('open-tab-content')) {
            button_tab?.classList.remove('open-tab-content');
        }

        this.checkTabShowMore(id);
    }

    tabToggle(event){
        event.preventDefault();
        event.stopPropagation();
        
        var $this = event.currentTarget,
            $thisContent = $this.parentNode.nextElementSibling;

        if ($this.classList.contains('popup-mobile') && window.innerWidth <= 551) {
            if ($($thisContent).hasClass('is-show')) {
                $($thisContent).removeClass('is-show');
            }
            else {
                $($thisContent).addClass('is-show');
            }
        }
        else {
            if(window.innerWidth <= 551 && $this.classList.contains('show-mobile')) {
                $this.classList.remove('is-open');
                $this.classList.remove('show-mobile');
                $($thisContent).slideUp('slow');
            }
            else if($this.classList.contains('is-open')){
                $this.classList.remove('is-open');
                if ((this.isVerticalPopup && window.innerWidth > 550) || ($this.matches('.sidebar-mobile') && window.innerWidth <= 550)) {
                    $thisContent.classList.remove('is-show');
                    document.body.classList.remove('tab-popup-show');
                }
                else {
                    $($thisContent).slideUp('slow');
                }
            } else {
                $this.classList.add('is-open');
                if ((this.isVerticalPopup && window.innerWidth > 550) || ($this.matches('.sidebar-mobile') && window.innerWidth <= 550)) {
                    $thisContent.classList.add('is-show');
                    document.body.classList.add('tab-popup-show');
                }
                else {
                    $($thisContent).slideDown('slow');
                }
            }
        }
    }

    readMoreReadLess(event){
        event.preventDefault();
        event.stopPropagation();

        var $this = event.target || event.target.closest('[data-show-more-toogle]'),
            id = $this.getAttribute('href').replace('#', ''),
            textShowMore = $this.getAttribute('data-show-more-text'),
            textShowLess = $this.getAttribute('data-show-less-text'),
            desMax = $this.closest('.tab-showMore').dataset.desMax;

        if($this.classList.contains('is-less')) {
            $this.closest('.tab-showMore').classList.remove('is-less');
            $this.classList.remove('is-less');
            $this.closest('.tab-showMore').classList.add('is-show');
            $this.classList.add('is-show');
            $this.innerText = textShowMore;
            document.getElementById(`${id}`).style.maxHeight = `${desMax}px`;
            this.tabContents.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        } else {
            $this.closest('.tab-showMore').classList.remove('is-show');
            $this.classList.remove('is-show');
            $this.closest('.tab-showMore').classList.add('is-less');
            $this.classList.add('is-less');
            $this.innerText = textShowLess;
            document.getElementById(`${id}`).style.maxHeight = 'unset';
        }
    }

    productTabClose(event) {
        event.preventDefault();
        event.stopPropagation();

        this.tabContents.classList.remove('is-show');

        this.tab.forEach((element, index) => {
            element.classList.remove('is-open');
            document.querySelector('.an-horizontal-shaking')?.classList.remove('open-tab-content');
        });

        this.tabContent.forEach((element, index) => {
            element.classList.remove('is-active');
            document.querySelector('.an-horizontal-shaking')?.classList.remove('open-tab-content');
        });

        if (window.innerWidth <= 551) {
            const $toggleContent = event.target.closest('.toggle-content');

            $toggleContent.classList.remove('is-show');
        }
    }

    checkTabShowMore(id) {
        if (window.innerWidth > 550) {
            const $thisContent = document.getElementById(`${id}`);
            const tabHeight = $thisContent.offsetHeight;
            const maxHeight = parseInt($thisContent.querySelector('.tab-showMore')?.dataset.desMax);
            if (tabHeight < maxHeight) {
                $thisContent.querySelector('.tab-showMore').remove();
            }
        }
    }

    onBackgroundClick(event) {
        if (event.target.closest('toggle-content.is-show') != null) return 
        document.querySelector('.toggleLink.is-open')?.classList.remove('is-open');
        document.querySelector('.toggle-content.is-show')?.classList.remove('is-show');
        document.body.classList.remove('tab-popup-show');
    }

    handleVerticalPopupClose(event) {
        const icon = event.target 
        icon.closest('.toggle-content').classList.remove('is-show')
        icon.closest('.tab-content').querySelector('.toggleLink').classList.remove('is-open')
        document.body.classList.remove('tab-popup-show')
    }
}

customElements.define('product-tab', ProductTabs);