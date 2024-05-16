/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

jQuery.cookie = function (b, j, m) { if (typeof j != "undefined") { m = m || {}; if (j === null) { j = ""; m.expires = -1 } var e = ""; if (m.expires && (typeof m.expires == "number" || m.expires.toUTCString)) { var f; if (typeof m.expires == "number") { f = new Date(); f.setTime(f.getTime() + (m.expires * 24 * 60 * 60 * 1000)) } else { f = m.expires } e = "; expires=" + f.toUTCString() } var l = m.path ? "; path=" + (m.path) : ""; var g = m.domain ? "; domain=" + (m.domain) : ""; var a = m.secure ? "; secure" : ""; document.cookie = [b, "=", encodeURIComponent(j), e, l, g, a].join("") } else { var d = null; if (document.cookie && document.cookie != "") { var k = document.cookie.split(";"); for (var h = 0; h < k.length; h++) { var c = jQuery.trim(k[h]); if (c.substring(0, b.length + 1) == (b + "=")) { d = decodeURIComponent(c.substring(b.length + 1)); break } } } return d } };

/**
 * Module to show Recently Viewed Products
 *
 * Copyright (c) 2014 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

Shopify.Products = (function () {
    var config = {
        howManyToShow: 3,
        howManyToStoreInMemory: 10,
        wrapperId: 'recently-viewed-products',
        templateId: 'recently-viewed-product-template',
        layout: 'slider',
        swipe: true,
        media: 'adapt',
        onComplete: null
    };
    var productHandleQueue = [];
    var wrapper = null;
    var template = null;
    var shown = 0;
    var shownSection = 0;
    var cookie = {
        configuration: {
            expires: 90,
            path: '/',
            domain: window.location.hostname
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
            jQuery.cookie(this.name, recentlyViewed.join(' '), this.configuration);
        },
        read: function () {
            var recentlyViewed = [];
            var cookieValue = jQuery.cookie(this.name);
            if (cookieValue !== null) {
                recentlyViewed = cookieValue.split(' ');
            }
            return recentlyViewed;
        },
        destroy: function () {
            jQuery.cookie(this.name, null, this.configuration);
        },
        remove: function (productHandle) {
            var recentlyViewed = this.read();
            var position = jQuery.inArray(productHandle, recentlyViewed);
            if (position !== -1) {
                recentlyViewed.splice(position, 1);
                this.write(recentlyViewed);
            }
        }
    };

    var finalize = function () {
        var items = wrapper.find('.item')
        if (items.length <= 2) $('#recently-viewed-products-list').addClass('center');

        $('#recently-viewed-products-list-2').addClass('recently-viewed-loaded');

        wrapper.show();
        // If we have a callback.
        if (config.onComplete) {
            try {
                config.onComplete();
            } catch (error) { }
        }
    };

    var moveAlong = function (wrapperP) {
        if (productHandleQueue.length && shown < config.howManyToShow) {
            var url = window.routes.root + '/products/' + productHandleQueue[shown] + '?view=ajax_recently_viewed';

            jQuery.ajax({
                type: 'get',
                url: url,
                cache: false,
                success: function (product) {
                    wrapperP.append(product);
                    shown++;
                    moveAlong(wrapperP);
                },
                error: function () {
                    cookie.remove(productHandleQueue[shown]);
                    shown++;
                    moveAlong(wrapperP);
                }
            });
        } else {
            finalize();
        }
    };

    var doAlong = function (wrapperS) {
        const recentlyViewed = wrapperS.parents('.halo-recently-viewed-block');

        if (productHandleQueue.length && shownSection < config.howManyToShow) {
            var url = window.routes.root + '/products/' + productHandleQueue[shownSection] + '?view=ajax_section_recently_viewed';

            jQuery.ajax({
                type: 'get',
                url: url,
                cache: false,
                success: function (product) {
                    wrapperS.append(product);
                    if (shownSection == 0) {
                        const productLoading = wrapperS.find('.product-item--loadingNoInfo').parents('.product');
                        productLoading.remove();
                    }
                    shownSection++;
                    doAlong(wrapperS);
                },
                error: function () {
                    console.log($.parseJSON(xhr.responseText).description);
                }
            });
        } else {
            if (productHandleQueue.length == 0) {
                recentlyViewed.hide();
                return;
            }

            if (config.layout == 'slider') {
                var productGrid = wrapperS,
                    itemToShow = productGrid.data('item-to-show'),
                    itemDots = productGrid.data('item-dots'),
                    itemDotsMb = productGrid.data('item-dots-mb'),
                    itemArrows = productGrid.data('item-arrows'),
                    itemArrowsMb = productGrid.data('item-arrows-mb');

                if (productGrid.length > 0) {
                    if (productGrid.not('.slick-initialized')) {
                        productGrid.slick({
                            mobileFirst: true,
                            adaptiveHeight: true,
                            vertical: false,
                            infinite: true,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            arrows: itemArrowsMb,
                            dots: itemDotsMb,
                            nextArrow: window.arrows.icon_next,
                            prevArrow: window.arrows.icon_prev,
                            rtl: window.rtl_slick,
                            responsive:
                                [
                                    {
                                        breakpoint: 1599,
                                        settings: {
                                            arrows: itemArrows,
                                            dots: itemDots,
                                            get slidesToShow() {
                                                if (itemToShow !== undefined && itemToShow !== null && itemToShow !== '') {
                                                    return this.slidesToShow = itemToShow;
                                                } else {
                                                    return this.slidesToShow = 1;
                                                }
                                            },
                                            get slidesToScroll() {
                                                if (itemToShow !== undefined && itemToShow !== null && itemToShow !== '') {
                                                    return this.slidesToScroll = itemToShow;
                                                } else {
                                                    return this.slidesToScroll = 1;
                                                }
                                            }
                                        }
                                    },
                                    {
                                        breakpoint: 1024,
                                        settings: {
                                            arrows: itemArrows,
                                            dots: itemDots,
                                            get slidesToShow() {
                                                if (itemToShow !== undefined && itemToShow !== null && itemToShow !== '') {
                                                    if (itemToShow == 5) {
                                                        return this.slidesToShow = itemToShow - 1;
                                                    } else {
                                                        return this.slidesToShow = itemToShow;
                                                    }
                                                } else {
                                                    return this.slidesToShow = 1;
                                                }
                                            },
                                            get slidesToScroll() {
                                                if (itemToShow !== undefined && itemToShow !== null && itemToShow !== '') {
                                                    if (itemToShow == 5) {
                                                        return this.slidesToScroll = itemToShow - 1;
                                                    } else {
                                                        return this.slidesToScroll = itemToShow;
                                                    }
                                                } else {
                                                    return this.slidesToScroll = 1;
                                                }
                                            }
                                        }
                                    },
                                    {
                                        breakpoint: 991,
                                        settings: {
                                            arrows: itemArrowsMb,
                                            dots: itemDotsMb,
                                            slidesToShow: 4,
                                            slidesToScroll: 4
                                        }
                                    },
                                    {
                                        breakpoint: 767,
                                        settings: {
                                            arrows: itemArrowsMb,
                                            dots: itemDotsMb,
                                            slidesToShow: 3,
                                            slidesToScroll: 3
                                        }
                                    },
                                    {
                                        breakpoint: 320,
                                        settings: {
                                            arrows: itemArrowsMb,
                                            dots: itemDotsMb,
                                            slidesToShow: 2,
                                            slidesToScroll: 2
                                        }
                                    }
                                ]
                        });
                    }
                }
            }
        }
    };

    return {
        resizeImage: function (src, size) {
            if (size == null) {
                return src;
            }

            if (size == 'master') {
                return src.replace(/http(s)?:/, "");
            }

            var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?/i);

            if (match != null) {
                var prefix = src.split(match[0]);
                var suffix = match[0];

                return (prefix[0] + "_" + size + suffix).replace(/http(s)?:/, "")
            } else {
                return null;
            }
        },

        showRecentlyViewed: function (params) {
            var params = params || {};

            // Update defaults.
            jQuery.extend(config, params);

            // Read cookie.
            productHandleQueue = cookie.read();

            // Template and element where to insert.
            template = config.templateId;
            wrapper = jQuery('#' + config.wrapperId);

            // How many products to show.
            config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

            // If we have any to show.
            if (config.howManyToShow && wrapper.length) {
                // Getting each product with an Ajax call and rendering it on the page.
                if (template == 'recently-viewed-product-popup') {
                    const wrapperP = wrapper;
                    moveAlong(wrapperP);
                } else {
                    const wrapperS = wrapper;
                    doAlong(wrapperS);
                }
            }
        },

        getConfig: function () {
            return config;
        },

        clearList: function () {
            cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
            var params = params || {};

            // Update defaults.
            jQuery.extend(config, params);

            // Read cookie.
            var recentlyViewed = cookie.read();

            // If we are on a product page.
            if (window.location.pathname.indexOf('/products/') !== -1) {
                // What is the product handle on this page.
                var splitted = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/);
                if (splitted == null) {
                    var productHandle = decodeURIComponent(window.location.pathname.split('/products/')[1]);
                } else {
                    var productHandle = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/)[1];
                }
                // In what position is that product in memory.
                var position = jQuery.inArray(productHandle, recentlyViewed);
                // If not in memory.
                if (position === -1) {
                    // Add product at the start of the list.
                    recentlyViewed.unshift(productHandle);
                    // Only keep what we need.
                    recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
                } else {
                    // Remove the product and place it at start of list.
                    recentlyViewed.splice(position, 1);
                    recentlyViewed.unshift(productHandle);
                }

                // Update cookie.
                cookie.write(recentlyViewed);
            }
        }
    };
})();