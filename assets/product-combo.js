class ProductCombo extends HTMLElement {
    constructor() {
        super();

        this.listItem = this.querySelectorAll('.bundle-product-item');
        this.form = this.querySelector('form.combo-form');
        this.selectContainers = this.querySelectorAll('[data-select-container]');
        this.addComboButton = this.querySelector('[data-combo-addtocart]');

        this.updateBundleTotalPrice();
        this.updateBundleText();

        this.form.addEventListener('change', this.onVariantChange.bind(this));
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

        this.querySelector('.bundle-product-wrapper').classList.remove('has-halo-block-loader');

        if (this.selectContainers) {
            this.selectContainers.forEach(container => {
                container.addEventListener('click', () => {
                    if (container.classList.contains('active')) {
                        container.classList.remove('active')
                    } else {
                        this.selectContainers.forEach(container => {
                            container.classList.remove('active')
                        })
                        container.classList.add('active')
                    }
                })

                container.querySelectorAll('.combo-item-label').forEach(optionLabel => {
                    optionLabel.addEventListener('click', () => {
                        container.classList.remove('active')
                    })
                })
            })

            document.addEventListener('click', e => {
                if (e.target.closest('[data-select-container]') == null) {
                    this.selectContainers.forEach(container => {
                        container.classList.remove('active')
                    })
                }
            })
        }

        this.listItem.forEach((item) => {
            this.updateVariants(item);
        });
    }

    onVariantChange(event) {
        this.changeSwatch(event);
        this.updateVariants(event);
        this.checkSelectVariants();
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.querySelector('.bundle-product-wrapper').classList.add('has-halo-block-loader');
        this.addComboButton.value = window.variantStrings.addingToCart
        
        const bundleItem = this.querySelectorAll('.bundle-product-item.isChecked');
        const discountCode = "COMBO-"+ meta.product.id;
        let data = '';
        let hint = ',';
        let attributes = {};

        Shopify.getCart((cart) => {
            const itemsInCart = cart.items;

            itemsInCart.forEach(element => {
                const variantId = element.id,
                      qty = element.quantity;
                if (variantId) {
                    data = `${variantId}:${qty}${hint}${data}`;
                }
            })
          
            bundleItem.forEach((item, index) => {
                const variantId = item.querySelector('[name=group_id]').value;
                
                if(variantId) {
                    let currentQuantity = 0
                    const addedSameItem = itemsInCart.find(item => item.id === parseInt(variantId))
                    if (addedSameItem != null) {
                        currentQuantity = addedSameItem.quantity
                    }

                    data = `${data}${variantId}:1${index == (bundleItem.length - 1) ? '' : hint}`;
                }
                
                if (index === bundleItem.length - 1) {
                    const addProductsToCart = async () => {
                        await fetch(`/cart/${data}`); 
                    }

                    const updateComboDiscountData = async () => {
                        const bundleDiscountRate = parseFloat(this.dataset.comboDiscountRate);

                        const items = [...bundleItem].map(item => parseInt(item.dataset.bundleProductItemId));
                        
                        const new_checkout_level_applications = [{ name: discountCode, bundleDiscountRate, items }];
                        const newAttributes = { ...attributes, checkout_level_applications: new_checkout_level_applications };
                        const attributesBody = JSON.stringify({ attributes: newAttributes });
                            
                        localStorage.setItem('storedDiscount', discountCode);

                        return await fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body: attributesBody }});
                    }

                    const applyDiscountCodeToServer = async () => {
                        if (bundleItem.length == this.form.querySelectorAll('.bundle-product-item').length) {
                            await fetch(`/discount/${discountCode}?redirect=/cart`) 
                        }
                    }

                    $.post( "/cart", () => {}).done( async () => {
                        try {
                            await addProductsToCart();
                            await updateComboDiscountData();
                            await applyDiscountCodeToServer();

                            this.addComboButton.value = window.variantStrings.addedToCart
                            this.addComboButton.disabled = true
                            this.redirectTo(window.routes.cart);
                        } catch (error) {
                            console.error(error)
                            this.addComboButton.value = window.variantStrings.addToCart
                        } finally {
                            this.querySelector('.bundle-product-wrapper').classList.remove('has-halo-block-loader');
                        }
                    });
                }
            });
        })
    }
    
    updateBundleText(showBundleText = true) {
        if (showBundleText) {
            if(document.querySelector('.bundle-price-in-main')){
                const bundlePrice = document.querySelector('.bundle-price-in-main');
                const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate')*100;
            }
        }
    }

    updateBundleTotalPrice(showBundleTotalPrice = true) {
        if (showBundleTotalPrice) {
            const bundleItem = this.querySelectorAll('.bundle-product-item.isChecked');
            const maxProduct = this.listItem.length;
            var totalPrice = 0;

            if(this.querySelector('.bundle-price-in-main')){
                const bundlePrice = document.querySelector('.bundle-price-in-main');
                const oldPrice = document.querySelector('.bundle-old-price-in-main');
                const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate');
            }

            if(bundleItem.length > 0){
                bundleItem.forEach((item) => {
                    const selectElement = item.querySelector('select[name=group_id]');
                    const inputElement = item.querySelector('input[name=group_id]');

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
                        
                        if(document.querySelector('.bundle-price-in-main')){
                            const bundlePrice = document.querySelector('.bundle-price-in-main');
                            const oldPrice = document.querySelector('.bundle-old-price-in-main');
                            const discountRate = bundlePrice.getAttribute('data-bundle-discount-rate');
                            
                            if(bundlePrice && oldPrice){
                                oldPrice.innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
                                bundlePrice.innerHTML = Shopify.formatMoney(totalPrice*(1 - discountRate), window.money_format);

                                if(bundleItem.length == maxProduct){
                                    bundlePrice.style.display = 'inline-block';
                                    oldPrice.style.display = 'inline-block';
                                    document.querySelector('[data-combo-product-total]').style.display = 'none';
                                } else {
                                    bundlePrice.style.display = 'none';
                                    oldPrice.style.display = 'none';
                                    document.querySelector('[data-combo-product-total]').style.display = 'block';
                                }
                            }
                        }

                        document.querySelector('[data-combo-product-total]').innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
                    }
                });
            } else {
                this.querySelector('[data-combo-addToCart]').value = window.total_btn.add_item.replace('[item]', bundleItem.length);
                document.querySelector('[data-combo-product-total]').innerHTML = Shopify.formatMoney(totalPrice, window.money_format);
            }
        }
    }

    updateVariants(event){
        const item = event?.target?.closest('.bundle-product-item') || event; // the event fallback is the item for the first run check
        const productId = item.getAttribute('data-bundle-product-item-id');
        const variants = window.productVariants[productId];
        const fieldsets = item.querySelectorAll('.swatch');
        
        let selectedOption1;
        let selectedOption2;
        let selectedOption3;

        if (variants) {
            if (fieldsets[0]) selectedOption1 = Array.from(fieldsets[0].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[1]) selectedOption2 = Array.from(fieldsets[1].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[2]) selectedOption3 = Array.from(fieldsets[2].querySelectorAll('input')).find((radio) => radio.checked).value;

            var checkStatus = (optionSoldout, optionUnavailable, swatch) => {
                swatch.parentElement.classList.contains('select-options')

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
                element.querySelectorAll('[data-header-option]').forEach(heading => {
                    heading.innerHTML = element.querySelector('input:checked').value;
                })
            }
            
            fieldsets.forEach((element) => {
                const optionIndex = parseInt(element.getAttribute('data-option-idx'));
                renderSwatch(optionIndex, element);
                checkAvailableVariant(element);
            });
        }
    }

    checkSelectVariants() {
        this.selectContainers.forEach(selectContainer => {
            const firstOptionLabel = selectContainer.querySelector('.combo-item-label:not(.soldout):not(:disabled)')
            const selectedOptionValue = selectContainer.querySelector('[data-header-option]').innerText
            const validValues = [...selectContainer.querySelectorAll('.select-options .swatch-element')]
                                    .filter(swatchElement => !swatchElement.classList.contains('soldout') && !swatchElement.disabled)
                                    .map(swatchElement => swatchElement.dataset.value) 
            if (!validValues.includes(selectedOptionValue) && firstOptionLabel) {
                firstOptionLabel.click()
            }
        })
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

        if (selectedVariant != undefined) {
            productInput.value = selectedVariant?.id;
            priceRegular.innerHTML = Shopify.formatMoney(selectedVariant.price, window.money_format);

            if (selectedVariant.compare_at_price > selectedVariant.price) {
                priceRegular.classList.add('special-price');

                if(priceOld){
                    priceOld.innerHtml = Shopify.formatMoney(selectedVariant.compare_at_price, window.money_format);
                    priceOld.style.display = 'block';
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

window.addEventListener('load', () => {
    customElements.define('product-combo', ProductCombo);
})