(function ($) {
	var halo = {
	    initSlidableSpotlight: function () {
            var slidableSpotlights = $('[data-slidable-spotlight]');

            if (slidableSpotlights.length) {
                slidableSpotlights.each(function () {
                    var self = $(this);
                    
                    if (self.not('.slick-initialized')) {
                        self.slick({    
                            dots: false,
                            slidesToShow: 1, 
                            slidesToScroll: 1,
                            verticalSwiping: false,
                            fade: false,    
                            cssEase: "ease",
                            adaptiveHeight: true,
                            autoplay: false,
                            autoplaySpeed: 3000,
                            arrows: true,   
                            nextArrow: window.arrows.icon_next,
                            prevArrow: window.arrows.icon_prev,
                            rtl: window.rtl_slick,
                            speed: 500,     
                            infinite: true, 
                            centerMode: true,   
                            centerPadding: '26%',
                            responsive: [{
                                breakpoint: 1366,
                                settings: {
                                    arrows: false,
                                    dots: true
                                }
                            },
                            {
                                breakpoint: 768,
                                settings: {
                                    arrows: false,
                                    dots: true,
                                    centerPadding: '30px'
                                }
                            }]
                        }); 
                    };
                });
            };
        }
	}
	halo.initSlidableSpotlight();
})(jQuery);
