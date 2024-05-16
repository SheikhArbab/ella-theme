Shopify.SearchByAllTypes = (function() {
	var config = {
		sectionId: 'main-search',
        onComplete: null
	};
	return {
		renderResultTable: function(params){
			var params = params || {};

    		$.extend(config, params);

    		this.section = document.getElementById(config.sectionId);

    		if(!this.section) return;

    		this.url = this.section.getAttribute('data-url');
    		this.id = this.section.getAttribute('data-id');

    		fetch(this.url)
            .then(response => response.text())
            .then(responseText => {
                const html = responseText;
                const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
                const resultElements = parsedHTML.querySelector(`div[id="${config.sectionId}"]`)?.querySelector('template').content.firstElementChild.cloneNode(true)

                if(resultElements && resultElements.innerHTML.trim().length) {
                    this.section.innerHTML = resultElements.innerHTML;
                } else {
                    this.section.remove();
                }

                const loadMoreArticleBtn = document.getElementById('article-page-load-btn')
                const articlesPerLoad = parseInt(loadMoreArticleBtn.dataset.itemsPerPage)
                const totalArticles = parseInt(loadMoreArticleBtn.dataset.total)
                const totalPages = Math.ceil(totalArticles / articlesPerLoad)
                let currentPageNum = 1

                if (totalArticles <= articlesPerLoad) {
                    loadMoreArticleBtn.style.display = 'none'
                } 

                if (totalPages <= 1) {
                    loadMoreArticleBtn.classList.add('disabled')
                }

                const articleAndPageElements = [...document.querySelectorAll('[data-listed-article-or-page]')]
                articleAndPageElements.forEach((element, index) => {
                    if (index < articlesPerLoad) {
                        element.classList.add('visible')
                    } else {
                        element.classList.remove('visible')
                    }
                })

                loadMoreArticleBtn.addEventListener('click', () => {
                    if (currentPageNum === totalPages) return 
                    currentPageNum++
                    loadMoreArticleBtn.classList.add('is-loading')
                    const randomTime = Math.random() * 500 + 500
                    setTimeout(() => {
                        articleAndPageElements.forEach((element, index) => {
                            if (index < articlesPerLoad * currentPageNum) {
                                element.classList.add('visible')
                            } else {
                                element.classList.remove('visible')
                            }
                        })
                        if (currentPageNum === totalPages) loadMoreArticleBtn.style.display = 'none'
                        loadMoreArticleBtn.classList.remove('is-loading')
                    }, randomTime)
                    
                })
            })
            .catch(e => {
                console.error(e);
            });
		}
	}
})();

