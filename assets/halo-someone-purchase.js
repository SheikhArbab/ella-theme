class SomeonePurchase extends HTMLElement {
	constructor() {
		super();

		this.popup = this;
        
        if (this.popup.getElementsByClassName('data-product').length == 0) return;

		this.time = this.popup.getAttribute('data-notification-time');
		this.timeText = this.popup.querySelector('[data-time-text]').textContent;

		this.timeText = this.timeText.replace(/(\r\n|\n|\r)/gm, '');

		if (this.getCookie('notification-popup') === ''){
			var initSomeonePurchasePopup = this.initSomeonePurchasePopup,
				popup = this.popup,
				timeText = this.timeText;

			var timer = setInterval(function() {
				if(popup.innerHTML.length > 0){
                	initSomeonePurchasePopup(popup, timeText);
				}
            }, this.time);
		} else {
			this.deleteCookie('notification-popup');
			this.remove();
		}

		this.querySelector('[data-close-notification-popup]').addEventListener(
            'click',
            this.setClosePopup.bind(this)
        );
	}

	setCookie(cname, cvalue, exdays) {
  		const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
	}

	getCookie(cname) {
        const name = cname + '=';
        const ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        
        return '';
    }

    deleteCookie(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setClosePopup(expiresDate = 1) {
        this.setCookie('notification-popup', 'closed', expiresDate);

        this.popup.classList.remove('is-active');
        this.popup.remove();
    }

    initSomeonePurchasePopup(popup, text){
    	if(popup.classList.contains('is-active')){
    		popup.classList.remove('is-active');
    	} else {
    		var product = popup.getElementsByClassName('data-product'),
    			popupImage = popup.getElementsByClassName('product-image'),
    			popupName = popup.getElementsByClassName('product-name'),
    			productLength= product.length,
                i = Math.floor(Math.random() * productLength),
                productItem = product[i],
                image = productItem.getAttribute('data-image'),
                title = productItem.getAttribute('data-title'),
                url = productItem.getAttribute('data-url'),
              
                locals =  popup.getElementsByClassName('data-local'),
                localLength= locals.length,
                i = Math.floor(Math.random() * localLength),
                localItem = locals[i],
                local = localItem.getAttribute('data-local'),
              
                times = popup.getElementsByClassName('data-time'),
                timeLength= times.length,
                i = Math.floor(Math.random() * timeLength),
                timeItem = times[i],
                time = timeItem.getAttribute('data-time');

            popup.classList.add('is-active');

            popupImage[0].setAttribute('href', url);
            popupImage[0].innerHTML = '<img src="'+ image +'" alt="'+ title +'" title="'+ title +'"><svg role="img" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="external-link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-external-link fa-w-16 fa-3x"><path d="M440,256H424a8,8,0,0,0-8,8V464a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V112A16,16,0,0,1,48,96H248a8,8,0,0,0,8-8V72a8,8,0,0,0-8-8H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V264A8,8,0,0,0,440,256ZM500,0,364,.34a12,12,0,0,0-12,12v10a12,12,0,0,0,12,12L454,34l.7.71L131.51,357.86a12,12,0,0,0,0,17l5.66,5.66a12,12,0,0,0,17,0L477.29,57.34l.71.7-.34,90a12,12,0,0,0,12,12h10a12,12,0,0,0,12-12L512,12A12,12,0,0,0,500,0Z" class=""></path></svg>';

            popupName[0].setAttribute('href', url);
            popupName[0].innerHTML = ''+ title +'';

            popup.querySelector('[data-time-text]').innerText = text.replace('[time]', time).replace('[location]', local);
    	}
    }
}

customElements.define('notification-popup', SomeonePurchase);