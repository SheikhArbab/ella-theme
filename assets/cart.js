class CartItems extends HTMLElement {
    constructor() {
        super();

        this.cartCountDown = document.getElementById(`CartCountdown-${this.dataset.section}`)
        this.giftCardElement = document.getElementById('is-a-gift')
        this.giftCardButton = document.getElementById('cart-gift-wrapping')
        this.removeButtons = document.querySelectorAll('[data-cart-remove]')
        this.toCheckoutButton = document.getElementById('cart-checkout')
        this.couponCodeInput = document.getElementById('cart-coupon-code')
        this.cartNoteInput = document.getElementById('cart-note')
        this.checkTerms = document.getElementById('cart_conditions')

        this.toCheckoutButton?.addEventListener('click', this.handleToCheckoutPage.bind(this))

        this.initToCheckoutButtonDisabling()
        this.initCartCountdown()
        if (this.giftCardElement) this.initGiftCardElement()
        this.initGiftCardManipulation()
        // this.initQuantityUpdateButtons()
  }

    initGiftCardElement() {
        const isChecked = this.giftCardButton?.dataset.isChecked
        if (isChecked === 'true') {
            const variantId = this.giftCardButton?.dataset.giftId
            const giftCardRemoveButton = document.querySelector(`[data-cart-remove-id="${variantId}"]`)
            const giftCardQuantityInput = document.querySelector(`[data-cart-quantity-id="${variantId}"]`)

            this.giftCardElement.style.display = 'none'
            giftCardRemoveButton?.addEventListener('click', () => {
                this.giftCardButton.dataset.isChecked = 'false'
            })

            giftCardQuantityInput?.addEventListener('change', (e) => {
                const value = Number(e.target.value)
                if (value  <= 0) {
                    this.giftCardButton.dataset.isChecked = 'false'
                }
            })
        } else {
          this.giftCardElement.style.display = 'flex'
        }
    }

    initGiftCardManipulation() {
        if (this.giftCardButton) {
            this.giftCardButton.removeEventListener('click', this.onAddGiftCardClick.bind(this))
            this.giftCardButton.addEventListener('click', this.onAddGiftCardClick.bind(this))
        }
    }

    onAddGiftCardClick(e) {
        e.preventDefault()
        e.stopPropagation()
        this.giftCardButton.dataset.isChecked = 'true'
    }

    initToCheckoutButtonDisabling() {
        if (this.checkTerms) {
            window.addEventListener('load', () => {
                this.toCheckoutButton.disabled = !this.checkTerms.checked
            })
        }
    }

    // initQuantityUpdateButtons() {
    //     this.querySelectorAll('.btn-quantity').forEach(button => {
    //         button.removeEventListener('click', this.onButtonClick.bind(this))
    //         button.addEventListener('click', this.onButtonClick.bind(this))
    //     })
    // }

    // onButtonClick(event) {
    //     event.preventDefault();
    //     const inputElement = event.target.parentElement.querySelector('.quantity');
    //     const value = Number(inputElement.value);
    //     let newVal
    //     if (event.target.classList.contains('plus')) {
    //         newVal = value + 1;
    //     } else {
    //         newVal = value - 1;
    //     }

    //     if (newVal >= 0) {
    //         const changeEvent = new Event('change', { bubbles: true })

    //         inputElement.value = newVal;
    //         inputElement.dispatchEvent(changeEvent);
    //     } 
    // }

    async handleToCheckoutPage(e) {
        e.preventDefault()

        try {
            // saving coupon
            const couponCode = this.couponCodeInput?.value 
            if (couponCode) {
                localStorage.setItem('storedDiscount', couponCode)
                const couponRes =  await fetch(`/discount/${couponCode}`)
                const text1 = await couponRes.text()
            }
            
            // saving cart note
            const cartNote = this.cartNoteInput?.value
            if (cartNote) {
                const cartNoteBody = JSON.stringify({ note: cartNote })
                const cartNoteRes = await fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body: cartNoteBody }})
                const text2 = await cartNoteRes.text()
            }

        } catch(error) {
            console.error(`Error: ${error.message}`)
        }

        let checkoutHref = this.toCheckoutButton.dataset.href;
        if (checkoutHref == null) {
            checkoutHref = `${window.routes?.root ? window.routes.root : ""}/checkout`;
        }
        
        window.location = checkoutHref;
    }

    initCartCountdown(){
        if(!this.cartCountDown) return;

        if(!this.cartCountDown.classList.contains('is-running')){
            const duration = this.cartCountDown.getAttribute('data-cart-countdown') * 60
            const element = this.cartCountDown.querySelector('.time');

            this.cartCountDown.classList.add('is-running');
            this.startTimerCartCountdown(duration, element);
        }
    }

    startTimerCartCountdown(duration, element){
        var timer = duration, minutes, seconds, text;

        var startCoundown = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            text = minutes + ":" + seconds;

            element.innerText = text;

            if (--timer < 0) {
                clearInterval(startCoundown);
                this.cartCountDown.remove();
            }
        }, 1000);
    }
}

customElements.define('cart-items', CartItems);

