(function ($) {
	var halo = {
	    initProductBanner: function() {
	        var productBanner = $('[data-banner-product]');
	        productBanner.each(function() {
	            var self = $(this);
	            self.slick({
	              	speed: 1000, 
	              	arrows: false,
                    dots: true,
	              	slidesToShow: 1,
	              	slidesToScroll: 1,
	              	rtl: window.rtl_slick,
	            });
	        });
	    }
	}
	halo.initProductBanner();
})(jQuery);