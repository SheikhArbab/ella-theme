(function ($) {
    var halo = {
        initReviewSlider: function () {
            var policyBlock = $('[data-review-slider]');

            policyBlock.each(function () {
                var self = $(this),
                    rows = parseInt(self.data('row')),
                    centerMode = self.data('center'),
                    row_tablet = (rows > 1 ? parseInt(rows - 1) : 1);

                if (self.not('.slick-initialized')) {
                    self.slick({
                        centerMode: centerMode,
                        centerPadding: '25%',
                        slidesToShow: rows,
                        slidesToScroll: rows,
                        autoplay: false,
                        dots: true,
                        speed: 800,
                        infinite: false,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        infinite: true,
                        responsive: [{
                                breakpoint: 1200,
                                settings: {
                                    centerMode: false,
                                    arrows: false,
                                    dots: true,
                                    slidesToShow: row_tablet,
                                    slidesToScroll: row_tablet
                                }
                            },
                            {
                                breakpoint: 992,
                                settings: {
                                    centerMode: false,
                                    arrows: false,
                                    dots: true,
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 768,
                                settings: {
                                    centerMode: false,
                                    arrows: false,
                                    dots: true,
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            }
                        ]
                    });
                }
            });
        }
    }
    halo.initReviewSlider();
})(jQuery);