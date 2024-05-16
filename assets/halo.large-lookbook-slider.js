(function ($) {
	var halo = {
	    initLargeLookbookSlider: function() {
	        var largeLookbookSliders = $('[data-large-lookbook-slider]');
	        largeLookbookSliders.each(function () {
	            var self = $(this)

	            if (self.not('.slick-initialized')) {
                    self.slick({
                        dots: false,
                        slidesToScroll: 1,
                        slidesToShow: 1,    
                        verticalSwiping: false,
                        fade: false,
                        cssEase: "ease",
                        adaptiveHeight: true,
                        autoplay: false,
                        arrows: true,
                        infinite: true, 
                        draggable: true,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        centerMode: true,
                        centerPadding: '20%',
                        speed: 400,
                        rtl: window.rtl_slick,
                        responsive: [{
                            breakpoint: 1024,
                            settings: {
                                arrows: false,
                                dots: true,
                                centerMode: true,
                                centerPadding: '50px',
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                arrows: false,
                                dots: true,
                                centerMode: false,
                                fade: true,
                            }
                        }
                        ]
                    });
	            }
	        });
	    }
	}
	halo.initLargeLookbookSlider();
})(jQuery);
