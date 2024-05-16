(function ($) {
    var halo = {
        initBlogPostSlider: function() {
            var blogBlock = $('[data-blogs-slider]');

            blogBlock.each(function() {
                var self = $(this),
                    rows = self.data('rows');
                if(self.not('.slick-initialized')) {
                    self.slick({
                        slidesToShow: rows,
                        slidesToScroll: 1,
                        speed: 1000,
                        autoplay: false,
                        infinite: false,
                        dots: false,
                        arrows: true,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [
                            {
                                breakpoint: 992,
                                settings: {
                                    slidesToShow: 2,
                                    dots: true,
                                    arrows: false,
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    slidesToShow: 1,
                                    dots: true,
                                    arrows: false,
                                }
                            }
                        ]
                    });
                };
            });
        }
    }
    halo.initBlogPostSlider();
})(jQuery);
