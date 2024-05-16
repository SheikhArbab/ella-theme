(function ($) {
	var halo = {
	    initBrandsSlider: function() {
	        var brandsSlider = $('[data-page-brands-slider]');

	        brandsSlider.each(function () {
	            var self = $(this),
	            	dataArrows = self.data('arrows'),
	            	dataDots = self.data('dots');

	            if (self.not('.slick-initialized')) {
	                self.slick({
	                    slidesToShow: self.data('rows'),
	                    slidesToScroll: 1,
	                    dots: dataDots,
	                    infinite: false,
	                    speed: 800,
	                    nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
	                    responsive: [{
	                            breakpoint: 1200,
	                            settings: {
	                                slidesToShow: 4,
	                                slidesToScroll: 4,
	                                arrows: dataArrows,
	                            }
	                        },
	                        {
	                            breakpoint: 992,
	                            settings: {
	                                slidesToShow: 3,
	                                slidesToScroll: 3,
	                                arrows: dataArrows,
	                            }
	                        },
	                        {
	                            breakpoint: 768,
	                            settings: {
	                                slidesToShow: 2,
	                                slidesToScroll: 2,
	                                arrows: dataArrows,
	                            }
	                        },
	                        {
	                            breakpoint: 480,
	                            settings: {
	                                slidesToShow: 1,
	                                slidesToScroll: 1,
	                                arrows: dataArrows,
	                            }
	                        }
	                    ]
	                });
	            }
	        });
	    }
	}
	halo.initBrandsSlider();
})(jQuery);
