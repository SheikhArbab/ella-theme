(function ($) {
    var halo = {
        imageBannderSlide: function() {
            var imageBanner = $('[data-image-banner-slide]');
            
            imageBanner.each(function() {
                var self = $(this),
                    arrowEnable = self.data('arrows')
                    dotEnable = self.data('dots')
                    autoplay = self.data('autoplay')
                    autoplaySpeed = self.data('autoplay-speed')
                self.slick({
                    infinite: false,
                    speed: autoplaySpeed,
                    autoplay: autoplay,         
                    arrows: arrowEnable,
                    dots: dotEnable,
                    infinite: true,
                    fade: true,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    rtl: window.rtl_slick,
                    responsive: [
                        {
                            breakpoint: 1500,
                            settings: {
                                arrows: false,
                            }
                        },
                    ]
                });
            });
        }
    }
    halo.imageBannderSlide();
})(jQuery);