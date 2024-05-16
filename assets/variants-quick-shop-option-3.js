class VariantQuickShopSelects extends HTMLElement {
    constructor() {
        super();
        this.variantSelect = this;
        this.item = $(this.variantSelect).closest('.quickshop');
        if(this.variantSelect.classList.contains('has-default')){
            this.updateOptions();
            this.updateMasterId();
            this.updateMedia(500);
            this.renderProductAjaxInfo();
            this.renderProductInfo();
            setTimeout(() => {this.checkQuantityWhenVariantChange()}, 20);
        }

        this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange(event) {
        this.updateOptions();
        this.updateMasterId();

        if (!this.currentVariant) {
            this.updateAttribute(true);
        } else {
            this.updateMedia(200);
            this.updateVariantInput();
            this.renderProductAjaxInfo();
            this.renderProductInfo();
            this.updateAttribute(false, !this.currentVariant.available);
            this.checkQuantityWhenVariantChange();
        }
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

    updateVariantInput() {
        const productForms = document.querySelectorAll(`#product-quick-view-form-${this.dataset.product}, #product-quick-view-form-installment-${this.dataset.product}`);
        productForms.forEach((productForm) => {
            const input = productForm.querySelector('input[name="id"]');
            input.value = this.currentVariant.id;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    renderProductAjaxInfo() {
        fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&view=quick_view`)
            .then((response) => response.text())
            .then((responseText) => {
                const id = `product-quick-view-price-${this.dataset.product}`;
                const quickViewid = `product-price-${this.dataset.product}`;
                const html = new DOMParser().parseFromString(responseText, 'text/html')
                const destination = document.getElementById(id);
                const source = html.getElementById(quickViewid);
                
                if (source && destination) {
                    destination.innerHTML = source.innerHTML;
                }

                document.getElementById(`product-quick-view-price-${this.dataset.product}`)?.classList.remove('visibility-hidden');
        });
    }

    renderProductInfo() {
        var variantList = this.getVariantData().filter((variant) => {
            return variant.available
        }); 

        var selectedOption1 = this.currentVariant?.option1,
            selectedOption2 = this.currentVariant?.option2,
            selectedOption3 = this.currentVariant?.option3,
            options = this.getElementsByClassName('product-form__input');

        $.each(options, (index, element) => {
            var position = $(element).data('option-index'),
                type = $(element).data('product-attribute');

            switch (position) {
                case 0:
                    $(element).find('[data-header-option]').text(selectedOption1);

                    if(type == 'set-select') {
                        var selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectedOption1){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option1List = variantList.filter((variant) => {
                        return variant.option1 === selectedOption1;
                    });

                    if(selectedOption2){
                        var inputList = $(options[1]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption3){
                        var inputList = $(options[2]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            electOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
                case 1:
                    $(element).find('[data-header-option]').text(selectedOption2);

                    if(type == 'set-select') {
                        var selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectedOption2){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option2List = variantList.filter((variant) => {
                        return variant.option2 === selectedOption2;
                    });

                    if(selectedOption1){
                        var inputList = $(options[0]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption3){
                        var inputList = $(options[2]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            electOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
                case 2:
                    $(element).find('[data-header-option]').text(selectedOption3);

                    if(type == 'set-select') {
                        var selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectedOption3){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option3List = variantList.filter((variant) => {
                        return variant.option3 === selectedOption3;
                    });

                    if(selectedOption1){
                        var inputList = $(options[0]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption2){
                        var inputList = $(options[1]),
                            input = inputList.find('.product-form__radio');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
            }
        });

        if(this.item.find('[data-sku]').length > 0){
            this.item.find('[data-sku] .productView-info-value').text(this.currentVariant.sku);
        }

        var inventory = this.currentVariant?.inventory_management;

        if(inventory != null) {
            var arrayInVarName = `quick_view_inven_array_${this.dataset.product}`,
                inven_array = window[arrayInVarName];

            if(inven_array != undefined) {
                var inven_num = inven_array[this.currentVariant.id],
                    inventoryQuantity = parseInt(inven_num);

                this.item.find('input[name="quantity"]').attr('data-inventory-quantity', inventoryQuantity);

                if(this.item.find('[data-inventory]').length > 0){
                    if(inventoryQuantity > 0){
                        this.item.find('[data-inventory] .productView-info-value').text(window.inventory_text.inStock);
                    } else {
                        this.item.find('[data-inventory] .productView-info-value').text(window.inventory_text.outOfStock);
                    }
                }

                if(this.item.find('.productView-hotStock').length > 0){
                    var hotStock = this.item.find('.productView-hotStock'),
                        maxStock = hotStock.data('hot-stock');

                    if(inventoryQuantity > 0 && inventoryQuantity <= maxStock){
                        var textStock = window.inventory_text.hotStock.replace('[inventory]', inventoryQuantity);
                        hotStock.text(textStock).show();
                    } else {
                        hotStock.hide();
                    }
                }
            }
        }
    }

    updateAttribute(unavailable = true, disable = true){
        const addButton = document.getElementById(`product-quick-view-form-${this.dataset.product}`)?.querySelector('[name="add"]');
        var quantityInput = this.item.find('input[name="quantity"]'),
            notifyMe = this.item.find('.productView-notifyMe'),
            hotStock = this.item.find('.productView-hotStock');
      var maxValue = parseInt(quantityInput.attr('data-inventory-quantity'))

        if(unavailable){
            var text = window.variantStrings.unavailable;

            quantityInput.attr('disabled', true);
            notifyMe.slideUp('slow');
            addButton.setAttribute('disabled', true);
            addButton.textContent = text;
            quantityInput.closest('quantity-quick-shop-input').addClass('disabled');

            if(hotStock.length > 0){
                hotStock.hide();
            }
        } else {
            if (disable) {
                var text = window.variantStrings.soldOut;

                quantityInput.attr('data-price', this.currentVariant?.price);
                quantityInput.attr('disabled', true);
                addButton.setAttribute('disabled', true);
                addButton.textContent = text;
                quantityInput.closest('quantity-quick-shop-input').addClass('disabled');

                if(notifyMe.length > 0){
                    notifyMe.find('.halo-notify-product-variant').val(this.currentVariant.title);
                    notifyMe.find('.notifyMe-text').empty();
                    notifyMe.slideDown('slow');
                }
            } else{
                var text;

                if(window.quick_view_subtotal.show && !document.body.classList.contains('quickshop-popup-show')) {
                    var price = this.currentVariant?.price,
                        subTotal = 0,
                        qty = quantityInput.val();

                    subTotal = qty * price;
                    subTotal = Shopify.formatMoney(subTotal, window.money_format);
                    subTotal = extractContent(subTotal);

                    text = window.quick_view_subtotal.text.replace('[value]', subTotal);
                } else {
                    if (this.currentVariant.available && this.currentVariant.inventory_management && maxValue === 0) {
                        text = window.variantStrings.preOrder;
                    } else {
                        text = window.variantStrings.addToCart;
                    }
                }

                quantityInput.attr('data-price', this.currentVariant?.price);
                quantityInput.attr('disabled', false);
                addButton.removeAttribute('disabled');
                addButton.textContent = text;
                quantityInput.closest('quantity-quick-shop-input').removeClass('disabled')

                if(notifyMe.length > 0){
                    notifyMe.slideUp('slow');
                }
            }
        }
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
        return this.variantData;
    }

    checkQuantityWhenVariantChange() {
       var quantityInput = this.closest('.productView-details').querySelector('input.quantity__input')
        var maxValue = parseInt(quantityInput.dataset.inventoryQuantity);
        var inputValue = parseInt(quantityInput.value);

        let value = inputValue 

        if (inputValue > maxValue && maxValue > 0) {
            value = maxValue
        } else {
            value = inputValue
        }

        if (value < 1 || isNaN(value)) value = 1 

        quantityInput.value = value

        let quantityAvailable
      
        if (this.currentVariant.inventory_management != null) {
          quantityAvailable = this.currentVariant.available && maxValue === 0
        } else {
          quantityAvailable = 'no-track-quantity'
        }
        document.getElementById('product-quick-shop-add-to-cart').dataset.available = quantityAvailable
    }
}

customElements.define('variant-quick-shop-selects', VariantQuickShopSelects);

class VariantQuickShopRadios extends VariantQuickShopSelects {
    constructor() {
        super();
    }

    updateOptions() {
        const fieldsets = Array.from(this.querySelectorAll('fieldset'));
        this.options = fieldsets.map((fieldset) => {
            return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
        });
    }
}

customElements.define('variant-quick-shop-radios', VariantQuickShopRadios);

class QuantityQuickShopInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.input.addEventListener('change', this.onInputChange.bind(this));
    }

    onInputChange(event) {
        event.preventDefault();
        var inputValue = this.input.value;
        const addButton = document.getElementById(`product-quick-view-form-${this.input.dataset.product}`)?.querySelector('[name="add"]');
        
        if(inputValue < 1) {
            inputValue = 1;

            this.input.value =  inputValue;
        }
            
        if(window.quick_view_subtotal.show) {
            var text,
                price = this.input.dataset.price,
                subTotal = 0;

            subTotal = inputValue * price;
            subTotal = Shopify.formatMoney(subTotal, window.money_format);
            subTotal = extractContent(subTotal);

            text = window.quick_view_subtotal.text.replace('[value]', subTotal);

            if (!document.body.classList.contains('quickshop-popup-show')) {
                addButton.textContent = text;
            }
        }
    }
}

customElements.define('quantity-quick-shop-input', QuantityQuickShopInput);