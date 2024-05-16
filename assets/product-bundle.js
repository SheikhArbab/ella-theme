class ProductBundle extends HTMLElement {
    constructor() {
        super();

        this.listItem = this.querySelectorAll('.bundle-product-item');
        this.form = this.querySelector('form');

        this.updateBundleTotalPrice();
        this.updateBundleText();

        this.form.addEventListener('change', this.onVariantChange.bind(this));
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

        if(this.querySelector('[data-bundle-checkbox]')){
            this.querySelectorAll('[data-bundle-checkbox]').forEach((checkbox) => {
                checkbox.addEventListener('click', this.onHandleCheckedProduct.bind(this));
            });

            document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
        }

        if(this.querySelector('.bundle-product-toogle')){
            this.querySelectorAll('.bundle-product-toogle').forEach((button) => {
                button.addEventListener('click', this.onHandleToogleProduct.bind(this));
            });

            document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
        }

        if(this.querySelector('.bundle-option-close')){
            this.querySelectorAll('.bundle-option-close').forEach((button) => {
                button.addEventListener('click', this.onHandleCloseProduct.bind(this));
            });
        }
    }

    onVariantChange(event) {
        this.changeSwatch(event);
        this.updateVariants(event);
    }

    onSubmitHandler(event) {
        event.preventDefault();
        const $this = this,
            btnAddTocart = $this.querySelector('[data-bundle-addtocart]');

        var waitMessage = window.variantStrings.addingToCart;

        this.querySelector('.bundle-product-wrapper').classList.add('has-halo-block-loader');

        const bundleItem = this.querySelectorAll('.bundle-product-item.isChecked');
        const discountCode = "FBT-BUNDLE-"+ meta.product.id;
        let data = '';
        let hint = ',';
        let attributes = {};

        const cartItem = document.querySelectorAll('.previewCartItem');

        if (cartItem) {
            cartItem.forEach(element => {
                const variantId = element.querySelector('.previewCartItem-qty').dataset.variant,
                    qty = parseInt(element.querySelector('input[name="quantity"]').value);

                if(variantId) {
                    data = `${variantId}:${qty}${hint}${data}`;
                }
            })
        }

        bundleItem.forEach((item, index) => {
            const variantId = item.querySelector('[name=group_id]').value;

            if(variantId) {
                data = `${data}${variantId}:1${index == (bundleItem.length - 1) ? '' : hint}`;
            }
        });

        $.post( "/cart", function(data) {
            btnAddTocart.value = waitMessage;
            attributes = data.attributes;
        }).done(async function() {
            const addProductsToCart = async () => {
                await fetch(`/cart/${data}`);
            }

            const updateBundleDiscountData = async () => {
                const bundleDiscountRate = parseFloat($this.querySelector('[data-bundle-discount-rate]').dataset.bundleDiscountRate);

                const items = [...bundleItem].map(item => parseInt(item.dataset.bundleProductItemId));

                const new_checkout_level_applications = [{ name: discountCode, bundleDiscountRate, items }];
                const newAttributes = { ...attributes, checkout_level_applications: new_checkout_level_applications };
                const attributesBody = JSON.stringify({ attributes: newAttributes });
                localStorage.setItem('storedDiscount', discountCode);
                
                await fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body: attributesBody }});
            }

            const applyDiscountCodeToServer = async () => {
                await fetch(`/discount/${discountCode}?redirect=cart`) 
            }

            try {
                await addProductsToCart();

                if (bundleItem.length == $this.form.querySelectorAll('.bundle-product-item').length) {
                    await updateBundleDiscountData();
                    await applyDiscountCodeToServer();
                }

                $this.querySelector('.bundle-product-wrapper').classList.remove('has-halo-block-loader');
                $this.redirectTo(window.routes.cart);
            } catch(err) {
                console.error(err);
            }
        });
    }

    onHandleCheckedProduct(event) {
        event.preventDefault();
        const $this = event.currentTarget;
        const item = event.target.closest('.bundle-product-item');
        const id = item.getAttribute('data-bundle-product-item-id');

        if(!this.querySelector(`[data-bundle-product-item-id="${id}"]`).classList.contains('isChecked')) {
            this.querySelector(`[data-bundle-product-item-id="${id}"]`).classList.add('isChecked');
            item.classList.add('isChecked');
            $this.previousElementSibling.setAttribute('checked', true);
        } else {
            this.querySelector(`[data-bundle-product-item-id="${id}"]`).classList.remove('isChecked');
            item.classList.remove('isChecked');
            $this.previousElementSibling.removeAttribute('checked');
        }

        this.updateBundleTotalPrice();
    }

    onHandleToogleProduct(event) {
        event.preventDefault();

        this.listItem.forEach((item) => {
            if(item.contains(event.target)){
                if(!item.classList.contains('is-open')){
                    item.classList.add('is-open');
                    this.updateVariants(event);
                } else {
                    item.classList.remove('is-open');
                }
            } else {
                item.classList.remove('is-open');
            }
        });
    }

    onHandleCloseProduct(event){
        event.preventDefault();

        var item = event.currentTarget.closest('.bundle-product-item');

        item.classList.remove('is-open');
    }

    updateBundleText(showBundleText = true) {
        if (showBundleText) {
            if(this.querySelector('.bundle-price')){
                const bundlePrice = this.querySelector('.bundle-price');
                const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate')*100;
                const discountText = this.querySelector('.bundle-product-text');

                discountText.innerHTML = discountText.textContent.replace('[discount]', discountRate);
                discountText.style.display = 'block';
            }
        }
    }

    updateBundleTotalPrice(showBundleTotalPrice = true) {
        if (showBundleTotalPrice) {
            const bundleItem = this.querySelectorAll('.bundle-product-item.isChecked');
            const maxProduct = this.listItem.length;

            var totalPrice = 0;

            if(this.querySelector('.bundle-price')){
                const bundlePrice = this.querySelector('.bundle-price');
                const oldPrice = this.querySelector('.bundle-old-price');
                const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate');
            }

            if(bundleItem.length > 0){
                bundleItem.forEach((item) => {
                    const selectElement = item.querySelector('select[name=group_id]'),
                        inputElement = item.querySelector('input[name=group_id]');

                    if(selectElement) {
                        var price = selectElement[selectElement.selectedIndex].getAttribute('data-price');
                    } else {
                        if (inputElement) {
                            var price = inputElement.getAttribute('data-price');
                        } else {
                            var price = item.querySelector('input[name=id]').getAttribute('data-price');
                        }
                    }

                    if(price) {
                        totalPrice = totalPrice + parseFloat(price);

                        if(this.querySelector('.bundle-price')){
                            const bundlePrice = this.querySelector('.bundle-price');
                            const oldPrice = this.querySelector('.bundle-old-price');
                            const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate');

                            if(bundlePrice && oldPrice){
                                oldPrice.innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
                                bundlePrice.innerHTML = Shopify.formatMoney(totalPrice*(1 - discountRate), window.money_format);

                                if(bundleItem.length == maxProduct){
                                    bundlePrice.style.display = 'inline-block';
                                    oldPrice.style.display = 'inline-block';
                                    this.querySelector('[data-bundle-product-total]').style.display = 'none';
                                } else {
                                    bundlePrice.style.display = 'none';
                                    oldPrice.style.display = 'none';
                                    this.querySelector('[data-bundle-product-total]').style.display = 'block';
                                }
                            }
                        }

                        if(bundleItem.length == maxProduct){
                            this.querySelector('[data-bundle-addtocart]').value = window.total_btn.add_all_item;
                        } else {
                            if(bundleItem.length > 2){
                                this.querySelector('[data-bundle-addtocart]').value = window.total_btn.add_items.replace('[item]', bundleItem.length);
                            } else {
                                this.querySelector('[data-bundle-addtocart]').value = window.total_btn.add_item.replace('[item]', bundleItem.length);
                            }
                        }

                        this.querySelector('[data-bundle-product-total]').innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
                    }
                });
            } else {
                this.querySelector('[data-bundle-addtocart]').value = window.total_btn.add_item.replace('[item]', bundleItem.length);
                this.querySelector('[data-bundle-product-total]').innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
            }
        }
    }

    updateVariants(event){
        const item = event.target.closest('.bundle-product-item');
        const productId = item.getAttribute('data-bundle-product-item-id');
        const variants = window.productVariants[productId];
        const fieldsets = event.target.closest('.bundle-product-item').querySelectorAll('.swatch');

        let selectedOption1;
        let selectedOption2;
        let selectedOption3;

        if (variants) {
            if (fieldsets[0]) selectedOption1 = Array.from(fieldsets[0].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[1]) selectedOption2 = Array.from(fieldsets[1].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[2]) selectedOption3 = Array.from(fieldsets[2].querySelectorAll('input')).find((radio) => radio.checked).value;

            var checkStatus = (optionSoldout, optionUnavailable, swatch) => {
                if(optionSoldout == undefined){
                    if (optionUnavailable == undefined) {
                        swatch.classList.add('soldout');
                        swatch.querySelector('input').setAttribute('disabled', true);
                    } else {
                        swatch.classList.add('soldout');
                        swatch.querySelector('input').setAttribute('disabled', true);
                    }
                } else {
                    swatch.classList.remove('soldout');
                    swatch.querySelector('input').removeAttribute('disabled');
                }
            }

            var renderSwatch = (optionIndex, element) => {
                const swatchs = element.querySelectorAll('.swatch-element');

                swatchs.forEach((swatch) => {
                    const swatchVal = swatch.getAttribute('data-value');

                    const optionSoldout = variants.find((variant) => {
                        switch (optionIndex) {
                            case 0: return variant.option1 == swatchVal && variant.available;
                            case 1: return variant.option1 == selectedOption1 && variant.option2 == swatchVal && variant.available;
                            case 2: return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                        }
                    });

                    const optionUnavailable = variants.find((variant) => {
                        switch (optionIndex) {
                            case 0: return variant.option1 == swatchVal;
                            case 1: return variant.option1 == selectedOption1 && variant.option2 == swatchVal;
                            case 2: return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal;
                        }
                    });

                    checkStatus(optionSoldout, optionUnavailable, swatch);
                });
            }

            var checkAvailableVariant = (element) => {
                element.querySelector('[data-header-option]').innerHTML = element.querySelector('input:checked').value;
            }

            fieldsets.forEach((element) => {
                const optionIndex = parseInt(element.getAttribute('data-option-idx'));

                renderSwatch(optionIndex, element);
                checkAvailableVariant(element);
            });
        }
    }

    changeSwatch(event) {
        const item = event.target.closest('.bundle-product-item');
        const fieldsets = Array.from(item.querySelectorAll('.swatch'));
        const productId = item.getAttribute('data-bundle-product-item-id');
        const variantList = window.productVariants[productId];
        const optionIndex = parseInt(event.target.closest('[data-option-idx]').getAttribute('data-option-idx'));
        const swatches = Array.from(item.querySelectorAll('.swatch-element'));
        const thisValue = event.target.value;
        const productPrice = item.querySelector('.bundle-product-price');
        const priceSale = productPrice.querySelector('.price-sale');
        const priceOld = productPrice.querySelector('.old-price');
        const priceRegular = productPrice.querySelector('[data-bundle-product-price]');
        const productInput = item.querySelector('[name=group_id]');
        const hotStock = item.querySelector('.bundle-hotStock');

        let selectedVariant;
        let selectedSwatchOption1;
        let selectedSwatchOption2;
        let selectedSwatchOption3;

        if (fieldsets[0]) selectedSwatchOption1 = Array.from(fieldsets[0].querySelectorAll('input')).find((radio) => radio.checked).value;
        if (fieldsets[1]) selectedSwatchOption2 = Array.from(fieldsets[1].querySelectorAll('input')).find((radio) => radio.checked).value;
        if (fieldsets[2]) selectedSwatchOption3 = Array.from(fieldsets[2].querySelectorAll('input')).find((radio) => radio.checked).value;

        swatches.forEach((swatche)=> {
            swatche.classList.remove('soldout');
            swatche.querySelector('input').setAttribute('disabled', false);
        })

        switch (optionIndex){
            case 0:
                var availableVariants = variantList.find((variant) => {
                    return variant.option1 == thisValue && variant.option2 == selectedSwatchOption2 && variant.available;
                });

                if(availableVariants != undefined){
                    selectedVariant = availableVariants;
                } else {
                    var altAvailableVariants = variantList.find((variant) => {
                        return variant.option1 == thisValue && variant.available;
                    });

                    selectedVariant = altAvailableVariants;
                }

                break;
            case 1:
                var availableVariants = variantList.find((variant) => {
                    return variant.option1 == selectedSwatchOption1 && variant.option2 == thisValue && variant.available;
                });

                if(availableVariants != undefined){
                    selectedVariant = availableVariants;
                } else {
                    console.log('Bundle Error: variant was soldout, on option selection #2')
                }

                break;
            case 2:
                var availableVariants = variantList.find((variant) => {
                    return variant.option1 == selectedSwatchOption1 && variant.option2 == selectedSwatchOption2 && variant.option3 == thisValue && variant.available;
                });

                if(availableVariants != undefined){
                   selectedVariant = availableVariants;
                } else {
                    console.log('Bundle Error: variant was soldout, on option selection #3')
                }

                break;
        }

        productInput.value = selectedVariant.id;
        priceRegular.innerHTML = Shopify.formatMoney(selectedVariant.price, window.money_format);
        if (selectedVariant.compare_at_price > selectedVariant.price) {
            priceRegular.classList.add('special-price');

            if(priceOld){
                priceOld.innerHtml = Shopify.formatMoney(selectedVariant.compare_at_price, window.money_format);
                priceOld.style.display = 'inline-block';
            }
        } else {
            if(priceOld){
                priceOld.style.display = 'none';
            }

            priceRegular.classList.remove('special-price');
        }

        item.querySelector('select').value = selectedVariant.id;

        this.updateBundleTotalPrice();

        if (selectedVariant.inventory_management != null) {
            if(hotStock) {
                var arrayInVarName = 'bundle_inven_array_' + productId,
                    inven_array = window[arrayInVarName],
                    maxStock = parseInt(hotStock.getAttribute('data-bundle-hot-stock'));

                if(inven_array != undefined) {
                    var inven_num = inven_array[selectedVariant.id],
                        inventoryQuantity = parseInt(inven_num);
                }

                if(inventoryQuantity > 0 && inventoryQuantity <= maxStock){
                    var textStock = window.inventory_text.hotStock.replace('[inventory]', inventoryQuantity);

                    hotStock.innerText = textStock;
                    hotStock.style.display = 'block';
                } else {
                    hotStock.style.display = 'none';
                }
            }
        }

        if(selectedVariant.featured_image){
            const productImage = this.querySelector(`[data-bundle-product-item-id="${productId}"] img`);

            productImage.setAttribute('src', selectedVariant.featured_image.src);
            productImage.setAttribute('srcset', selectedVariant.featured_image.src);
        }

        if (this.checkNeedToConvertCurrency()) {
            Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
        }
    }

    onBodyClickEvent(event){
        if(this.querySelector('.bundle-product-item.is-open')){
            this.listItem.forEach((item) => {
                if(!item.contains(event.target)){
                    item.classList.remove('is-open');
                }
            });
        }
    }

    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    redirectTo(url){
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    checkNeedToConvertCurrency() {
        return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
    }
}

customElements.define('product-bundle', ProductBundle);