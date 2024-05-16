class CartTool extends HTMLElement {
  constructor() {
    super();
    const buttons = this.querySelectorAll('.cartTool-item');
    buttons.forEach((button) => {
      button.addEventListener('click',(event) => {
        const id = event.target.dataset.popup;
        document.getElementById(id).classList.add('show');
        document.querySelector('.previewCart').classList.add('active-tool');
      })
    })
  }
}

customElements.define('cart-item-tool', CartTool);

class CartCancel extends HTMLElement {
  constructor() {
    super();
    
    this.querySelector('button').addEventListener('click',(event) => {
      document.querySelector('.popup-toolDown.show').classList.remove('show');
      document.querySelector('.previewCart').classList.remove('active-tool');
    })
  }
}

customElements.define('cart-cancel-popup', CartCancel);

class CartNote extends HTMLElement {
  constructor() {
    super();
    
    this.querySelector('[data-update-note]').addEventListener('click', (event) => {
      this.val = this.querySelector('.text-area').value;
      const body = JSON.stringify({ note: this.val });
      fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }});
      document.querySelector('.popup-toolDown.show').classList.remove('show');
      document.querySelector('.previewCart').classList.remove('active-tool');
    })
  }
}

customElements.define('cart-note', CartNote);

class CouponCode extends HTMLElement {
  constructor() {
    super();
    if (localStorage.getItem('storedDiscount')){
      this.querySelector('input[name="discount"]').value = localStorage.getItem('storedDiscount');  
    }
    this.querySelector('[data-update-coupon]').addEventListener('click', (event) => {
      this.val = this.querySelector('input[name="discount"]').value;
      localStorage.setItem('storedDiscount', this.val);
      fetch(`/discount/${this.val}`)
          .then((response) => response.text())
          .then((responseText) => {
        	
      });
      document.querySelector('.popup-toolDown.show').classList.remove('show');
      document.querySelector('.previewCart').classList.remove('active-tool');
    })
  }
}

customElements.define('coupon-code', CouponCode);