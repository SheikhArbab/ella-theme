class VariantQuickViewSelects extends HTMLElement {
    constructor() {
        super();
        this.item = this.closest('.quickView');
        this.variants = this.getVariantData();

        this.onVariantInit = debounce(() => {
            this.updateOptions();
            this.updateMasterId();
            this.updateMedia(500);
            this.updateVariants(this.variants);
            if (this.checkNeedToConvertCurrency()) {
                let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');

                Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
            }
        }, 500);

        this.onVariantInit();
        this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange(event) {
        this.updateOptions();
        this.updateMasterId();
        this.updateVariants(this.variants);

        if (!this.currentVariant) {
            this.updateAttribute(true);
        } else {
            this.updateMedia(200);
            this.updateProductInfo();
            this.updateAttribute(false, !this.currentVariant.available);
            this.checkQuantityWhenVariantChange();
        }
    }

    updateVariants(variants){
        if (!variants) return;
        const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
        const inputWrappers = [...this.querySelectorAll('.product-form__input')];
        const inputLength = inputWrappers.length;
        inputWrappers.forEach((option, index) => {
            option.querySelector('[data-header-option]').innerText = option.querySelector(':checked').value;
            if (index === 0 && inputLength > 1) return;
            const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
            const previousOptionSelected = inputLength > 1 ? inputWrappers[index - 1].querySelector(':checked').value : inputWrappers[index].querySelector(':checked').value;
            const optionInputsValue = inputLength > 1 ? selectedOptionOneVariants.filter(variant => variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]) : this.variantData.map(variantOption => variantOption[`option${ index + 1 }`]);
            const availableOptionInputsValue = inputLength > 1 ? selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]) : this.variantData.filter(variant => variant.available).map(variantOption => variantOption[`option${ index + 1 }`]);
            this.setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue)
        });
    }

    setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue) {
        optionInputs.forEach(input => {
            if (availableOptionInputsValue.includes(input.getAttribute('value'))) {
                input.classList.remove('soldout');
                input.innerText = input.getAttribute('value');
            } else {
                input.classList.add('soldout');
                optionInputsValue.includes(input.getAttribute('value')) ? input.innerText = input.getAttribute('value') + ' (Sold out)' : input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'))
            }
        });
    }

    updateOptions() {
        this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }

    updateMasterId() {
        this.currentVariant = this.getVariantData().find((variant) => {
            return !variant.options.map((option, index) => {
                return this.options[index] === option;
            }).includes(false);
        });
    }

    updateMedia(time) {
        if (!this.currentVariant || !this.currentVariant?.featured_media) return;

        const newMedia = document.querySelector(
            `[data-media-id="${this.dataset.product}-${this.currentVariant.featured_media.id}"]`
        );

        if (!newMedia) return;

        window.setTimeout(() => {
            $(newMedia).trigger('click');
        }, time);
    }

    updateProductInfo() {
        const fetchPrice = async () => {
            try {
                const res = await fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&view=ajax_product_price`);
                const text = await res.text();
                const html = new DOMParser().parseFromString(text, 'text/html');

                const destination = document.getElementById(`product-quick-view-price-${this.dataset.product}`);
                const source = html.getElementById(`product-price-${this.dataset.product}`);
                
                if (source && destination) {
                    destination.innerHTML = source.innerHTML;
                }

                if (this.checkNeedToConvertCurrency()) {
                    let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');

                    Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                }

                destination?.classList.remove('visibility-hidden');
            } catch (err) { 
                console.log('Something went wrong to fetch data!')
            }   
        }           

        fetchPrice();
    }

    updateAttribute(unavailable = true, disable = true){
        this.quantityInput = this.item.querySelector('input[name="quantity"]');
        this.inventoryProp = this.item.querySelector('[data-inventory]');
        this.skuProp = this.item.querySelector('[data-sku]');
        this.notifyMe = this.item.querySelector('.productView-notifyMe');
        this.hotStock = this.item.querySelector('.productView-hotStock');
        const addButton = document.getElementById(`product-quick-view-form-${this.dataset.product}`)?.querySelector('[name="add"]');
        const productForms = document.querySelectorAll(`#product-quick-view-form-${this.dataset.product}, #product-quick-view-form-installment-${this.dataset.product}`);

        let quantityInputValue = parseInt(this.quantityInput?.value),
            quantityInputMaxValue,
            alertText = window.inventory_text.max,
            alertMessage = `<div class="alertBox alertBox--error"><p class="alertBox-message">${alertText}</p></div>`;

        if(unavailable){
            let text = window.variantStrings.unavailable;

            this.quantityInput?.setAttribute('disabled', true);

            if(this.notifyMe){
                this.notifyMe.style.display = 'none';
            }

            if(this.hotStock){
                this.hotStock.style.display = 'none';
            }

            addButton.setAttribute('disabled', true);
            addButton.textContent = text;
            this.quantityInput?.closest('quantity-quick-view-input').classList.add('disabled');
        } else {
            if (disable) {
                let text = window.variantStrings.soldOut;

                this.quantityInput?.setAttribute('data-price', this.currentVariant?.price);
                this.quantityInput?.setAttribute('disabled', true);
                addButton.setAttribute('disabled', true);
                addButton.textContent = text;
                this.quantityInput?.closest('quantity-quick-view-input').classList.add('disabled');

                if(this.inventoryProp){
                    this.inventoryProp.querySelector('.productView-info-value').textContent = window.inventory_text.outOfStock;
                }

                if(this.notifyMe){
                    this.notifyMe.querySelector('.halo-notify-product-variant').value = this.currentVariant.title;
                    this.notifyMe.querySelector('.notifyMe-text').innerHTML = '';
                    this.notifyMe.style.display = 'block';
                }

                if(this.hotStock){
                    this.hotStock.style.display = 'none';
                }
            } else{
                let text,
                    inventory = this.currentVariant?.inventory_management,
                    arrayInVarName,
                    inven_array,
                    inven_num, 
                    inventoryQuantity;
                
                if(inventory != null) {
                    arrayInVarName = `quick_view_inven_array_${this.dataset.product}`;
                    inven_array = window[arrayInVarName];

                    if(inven_array != undefined) {
                        inven_num = inven_array[this.currentVariant.id];
                        inventoryQuantity = parseInt(inven_num);
                        if (typeof inventoryQuantity != 'undefined'){
                            if(inventoryQuantity > 0) {
                                this.quantityInput?.setAttribute('data-inventory-quantity', inventoryQuantity);
                            } else {
                                this.quantityInput?.removeAttribute('data-inventory-quantity');
                            }
                        } else {
                            this.quantityInput?.setAttribute('data-inventory-quantity', inventoryQuantity);
                        }
                    }
                }
              
                if (typeof inventoryQuantity != 'undefined'){
                    if(inventoryQuantity > 0) {
                        text = window.variantStrings.addToCart;
                    } else  {
                        text = window.variantStrings.preOrder;
                    }
                } else{
                    text = window.variantStrings.addToCart;
                }

                this.quantityInput?.setAttribute('data-price', this.currentVariant?.price);
                this.quantityInput?.removeAttribute('disabled');

                addButton.innerHTML = text;
                addButton.removeAttribute('disabled');
                this.quantityInput?.removeAttribute('disabled');
                this.quantityInput?.closest('quantity-quick-view-input').classList.remove('disabled');
              
                if(window.quick_view_subtotal.show) {
                    let subTotal = 0;
                    let price = this.quantityInput?.dataset.price
                        
                    subTotal = quantityInputValue * price;
                    subTotal = Shopify.formatMoney(subTotal, window.money_format);
                    subTotal = extractContent(subTotal);
                            
                    const moneySpan = document.createElement('span')
                    moneySpan.classList.add(window.currencyFormatted ? 'money' : 'money-subtotal') 
                    moneySpan.innerText = subTotal 
                    document.body.appendChild(moneySpan) 
                    
                    if (this.checkNeedToConvertCurrency()) {
                        let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
                        Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                    }
        
                    subTotal = moneySpan.innerText 
                    $(moneySpan).remove()
                    const pdView_subTotal = document.querySelector('.quickView .productView-subtotal .money') || document.querySelector('.quickView .productView-subtotal .money-subtotal');
                    pdView_subTotal.innerText = subTotal;
                }

                if(inventoryQuantity > 0) {
                    addButton.classList.remove('button-text-pre-order');
                    quantityInputMaxValue = parseInt(this.quantityInput?.getAttribute('data-inventory-quantity'));

                    if(this.inventoryProp != null){
                        if(inventoryQuantity > 0){
                            const showStock = this.inventoryProp.getAttribute('data-stock-level');
                            if (showStock == 'show') {
                                this.item.querySelector('[data-inventory] .productView-info-value').textContent = inventoryQuantity+' '+window.inventory_text.inStock;
                            }
                            else {
                                this.item.querySelector('[data-inventory] .productView-info-value').textContent = window.inventory_text.inStock;
                            }
                        } else {
                            this.item.querySelector('[data-inventory] .productView-info-value').textContent = window.inventory_text.outOfStock;
                        }
                    }

                    if(this.hotStock){
                        let maxStock = parseInt(this.hotStock.getAttribute('data-hot-stock'));

                        if(0 < inventoryQuantity && inventoryQuantity <= maxStock){
                            let textStock = window.inventory_text.hotStock.replace('[inventory]', inventoryQuantity);

                            this.hotStock.innerHTML = textStock;
                            this.hotStock.style.display = 'block';
                        } else {
                            this.hotStock.innerHTML = '';
                            this.hotStock.style.display = 'none';
                        }
                    }
                } else{
                    addButton.removeAttribute('disabled');
                    addButton.classList.add('button-text-pre-order');

                    if(this.inventoryProp){
                        this.inventoryProp.querySelector('.productView-info-value').textContent = window.inventory_text.inStock;
                    }

                    if(this.hotStock){
                        this.hotStock.style.display = 'none';
                    }
                }

                if(this.notifyMe){
                    this.notifyMe.style.display = 'none';
                }

                if (this.checkNeedToConvertCurrency()) {
                    let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');

                    Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                }
            }
            
            if(this.skuProp && this.currentVariant.sku){
                this.skuProp.querySelector('.productView-info-value').textContent = this.currentVariant.sku;
            }

            productForms.forEach((productForm) => {
                const input = productForm.querySelector('input[name="id"]');

                input.value = this.currentVariant.id;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.getAttribute('data-json'));

        return this.variantData;
    }

    checkNeedToConvertCurrency() {
        if (typeof Currency == 'undefined') return window.show_auto_currency;
        return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
    }

    checkQuantityWhenVariantChange() {
        var quantityInput = this.closest('.productView-details').querySelector('input.quantity__input')
        var maxValue = parseInt(quantityInput?.dataset.inventoryQuantity);
        var inputValue = parseInt(quantityInput?.value);
        
        let value = inputValue 

        if (inputValue > maxValue && maxValue > 0) {
            value = maxValue
        } else {
            value = inputValue
        }

        if (value < 1 || isNaN(value)) value = 1 

        if (quantityInput != null) quantityInput.value = value

        document.getElementById('product-add-to-cart').dataset.available = this.currentVariant.available && maxValue <= 0
    }
}

customElements.define('variant-quick-view-selects', VariantQuickViewSelects);

class VariantQuickViewRadios extends VariantQuickViewSelects {
    constructor() {
        super();
    }

    setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue) {
        optionInputs.forEach(input => {
            if (availableOptionInputsValue.includes(input.getAttribute('value'))) {
                input.nextSibling.classList.remove('soldout', 'unavailable');
                input.nextSibling.classList.add('available');
            } else {
                input.nextSibling.classList.remove('available', 'unavailable');
                input.nextSibling.classList.add('soldout');

                if (window.variantStrings.hide_variants_unavailable && !optionInputsValue.includes(input.getAttribute('value'))) {
                    input.nextSibling.classList.add('unavailable')
                    if (!input.checked) return;
                    let inputsValue;
                    availableOptionInputsValue.length > 0 ? inputsValue = availableOptionInputsValue : inputsValue = optionInputsValue;
                    input.closest('.product-form__input').querySelector(`input[value="${inputsValue[0]}"]`).checked = true;
                    this.dispatchEvent(new Event('change'))
                }
            }
        });
    }

    updateOptions() {
        const fieldsets = Array.from(this.querySelectorAll('fieldset'));

        this.options = fieldsets.map((fieldset) => {
            return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
        });
    }
}

customElements.define('variant-quick-view-radios', VariantQuickViewRadios);

class QuantityQuickViewInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', { bubbles: true });
        this.input.addEventListener('change', this.onInputChange.bind(this));

        this.querySelectorAll('button').forEach(
            (button) => button.addEventListener('click', this.onButtonClick.bind(this))
        );
    }

    onInputChange(event) {
        event.preventDefault();
        var inputValue = this.input.value;
        var maxValue = parseInt(this.input.dataset.inventoryQuantity);
        var currentId = document.getElementById(`product-quick-view-form-${this.input.dataset.product}`)?.querySelector('[name="id"]')?.value;
        var saleOutStock  = document.getElementById('product-add-to-cart').dataset.available === 'true' || false ;
        const addButton = document.getElementById(`product-quick-view-form-${this.input.dataset.product}`)?.querySelector('[name="add"]');
        
        if(inputValue < 1) {
            inputValue = 1;

            this.input.value =  inputValue;
        }
        
        if (inputValue > maxValue && !saleOutStock && maxValue > 0) {
            var arrayInVarName = `quick_view_selling_array_${this.input.dataset.product}`,
                itemInArray = window[arrayInVarName],
                itemStatus = itemInArray[currentId];
            
            if(itemStatus == 'deny') {
                inputValue = maxValue
                this.input.value =  inputValue;
                const message = getInputMessage(maxValue);
                showWarning(message, 3000);
            }
        } else if (inputValue > maxValue && saleOutStock && maxValue === 0) {
            this.input.value = inputValue;
        } 

        this.input.value =  inputValue;
        document.querySelectorAll('quantity-quick-view-input input[name="quantity"]').forEach(input => {
            if (this.input != input) input.value = inputValue
        })
      
        const mainQty = document.querySelector('.quantity__group--1 .quantity__input');
            mainQty.value = inputValue;

        if(window.quick_view_subtotal.show) {
            var text,
                price = this.input.dataset.price,
                subTotal = 0;

            var parser = new DOMParser();

            subTotal = inputValue * price;
            subTotal = Shopify.formatMoney(subTotal, window.money_format);
            subTotal = extractContent(subTotal);

            const moneySpan = document.createElement('span')
            moneySpan.classList.add(window.currencyFormatted ? 'money' : 'money-subtotal')
            moneySpan.innerText = subTotal 
            document.body.appendChild(moneySpan) 

            if (this.checkNeedToConvertCurrency()) {
                let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
                Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
            }

            subTotal = moneySpan.innerText 
            $(moneySpan).remove()
            const pdView_subTotal = document.querySelector('.quickView .productView-subtotal .money') || document.querySelector('.quickView .productView-subtotal .money-subtotal');
            pdView_subTotal.innerText = subTotal;
        }   
    }

    onButtonClick(event) {
        event.preventDefault();
        const previousValue = this.input.value;

        event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
        if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }

    checkNeedToConvertCurrency() {
        if (typeof Currency == 'undefined') return window.show_auto_currency;
        return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
    }
}

customElements.define('quantity-quick-view-input', QuantityQuickViewInput);

function showWarning(content, time = null) {
    if (window.warningTimeout) {
        clearTimeout(window.warningTimeout);
    }
    const warningPopupContent = document.getElementById('halo-warning-popup').querySelector('[data-halo-warning-content]')
    warningPopupContent.textContent = content
    document.body.classList.add('has-warning')

    if (time) {
        window.warningTimeout = setTimeout(() => {
            document.body.classList.remove('has-warning')
        }, time)
    }
}

function getInputMessage(maxValue) {
    var message = window.cartStrings.addProductOutQuantity.replace('[maxQuantity]', maxValue);
    return message
}