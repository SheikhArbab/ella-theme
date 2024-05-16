class BlogPostsList extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.mainViews = [...this.querySelectorAll('[data-main-view]')];
        this.listItems = [...this.querySelectorAll('[data-list-item]')];
        this.seizerElement = this.querySelector('[data-seizer]')
        this.initialized = false

        this.init();
    }

    init() {
        this.setSeizerHeight(this.mainViews[0]);

        this.listItems.forEach(item => {
            item.addEventListener('click', this.onListItemClick.bind(this));
        })
    }
    
    onListItemClick(e) {
        e.preventDefault();

        let item  
        
        if (e.target.matches('[data-list-item]')) {
            item = e.target
        } else if (e.target.closest('[data-list-item]')) (
            item = e.target.closest('[data-list-item]')
        )

        if (!item) return 
        
        const articleId = item.dataset.articleId ;
            
        if (!articleId) return 

        const mainArticleView = this.mainViews.find(view => view.dataset.articleId === articleId)

        this.setActiveListItem(item)
        this.setActiveMainView(mainArticleView)
        this.setSeizerHeight(mainArticleView)
        this.scrollToView(mainArticleView)
    }

    onListItemHover(e) {
        const item = e.target;
        const articleId = item.dataset.articleId ;

        if (!articleId) return 

        const mainArticleView = this.mainViews.find(view => view.dataset.articleId === articleId)

        this.setActiveListItem(item)
        this.setActiveMainView(mainArticleView)
        this.setSeizerHeight(mainArticleView)
        this.scrollToView(mainArticleView)
    }   

    setActiveListItem(activeItem) {
        this.setAndRemoveActiveState('list-item', activeItem);
    }

    setActiveMainView(activeView) {
        this.setAndRemoveActiveState('main-view', activeView);
    }

    setAndRemoveActiveState(type, activeElement) {
        const elements = type === 'list-item' ? this.listItems : this.mainViews;

        elements.forEach(element => {
            element.classList.remove('is-active')
        })

        activeElement.classList.add('is-active')
    }

    setSeizerHeight(activeView) {
        this.seizerElement.style.height = activeView.getBoundingClientRect().height + 'px';

        if (!this.initialized) {
            this.classList.remove('loading');
            this.initialized = true
        }
    }

    scrollToView(activeView) {
        if (window.innerWidth < 1024) {
            const topSpace = activeView.getBoundingClientRect().top;
            const headerHeight = document.querySelector('sticky-header') ? document.querySelector('sticky-header').clientHeight : 0
            window.scrollBy({   
                top: topSpace - 15 - headerHeight,
                behavior: 'smooth'
            })          
        }
    }   
}

window.addEventListener('load', () => {
    customElements.define('blog-posts-list', BlogPostsList)
})