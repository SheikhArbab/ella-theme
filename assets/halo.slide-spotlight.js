(function ($) {
    var halo = {
        initSpotlightSlider: function() {
            var spotlightBlock = $('[data-spotlight-slider]');
            
            spotlightBlock.each(function() {
                var self = $(this),
                    dataRows = self.data('rows'),
                    dataRowsMb = self.data('rows-mb'),
                    dataArrows = self.data('arrows'),
                    dataArrowsMB = self.data('arrows-mb'),
                    dataDots = self.data('dots'),
                    dataDotsMB = self.data('dots-mb'),
                    dataSwipe = self.data('swipe');
                    
                if ((dataSwipe == 'list' || dataSwipe == 'scroll') && window.innerWidth < 768) return;
                self.slick({
                    infinite: true,
                    speed: 1000, 
                    arrows: dataArrows,
                    dots: dataDots,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    slidesToShow: dataRows,
                    slidesToScroll: 1,
                    rtl: window.rtl_slick,
                      responsive: [
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 2,
                                arrows: dataArrowsMB,
                                dots: dataDotsMB
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: dataRowsMb,
                                arrows: dataArrowsMB,
                                dots: dataDotsMB
                            }
                        }                                          
                      ]
                });
            });
        }
    }
    halo.initSpotlightSlider();
})(jQuery);