(function ($) {
    var halo = {
        initSmallImgSlider: function() {
            var smallImgBlock = $('[data-smallImg-slide]');
            
            smallImgBlock.each(function() {
                var self = $(this)
                self.slick({
                    infinite: true,
                    speed: 1000, 
                    arrows: false,
                    dots: true,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    rtl: window.rtl_slick,
                });
            });
        }
    }
    halo.initSmallImgSlider();
})(jQuery);