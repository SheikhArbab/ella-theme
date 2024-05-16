(function ($) {
	var halo = {
	    initInstagramSlider: function() {
	        var instagramBlock = $('[data-instagram-feed]');

	        instagramBlock.each(function() {
	            var self = $(this),
	                dataRows = self.data('rows'),
	                dataSlideRow = self.data('slide-rows'),
	                dataArrow = self.data('arrow'),
	                dataMode = self.data('mode'),
	                dataLimit = self.data('limit');
	                
	            if (dataSlideRow == 2) {
            		var x =  self.children();
		            for (i = 0; i < x.length ; i += 2) {
		              x.slice(i,i+2).wrapAll('<div class="'+ i +'"></div>');
		            }
	            }

	            self.slick({
	              	infinite: false,
	              	speed: 1000, 
	              	centerMode: dataMode,
					get centerPadding() {
					    if (dataMode == true) {
					        return this.centerPadding = '11.36%';
					    }
					},
					get infinite() {
					    if (dataMode == true) {
					        return this.infinite = true;
					    }
					},
	              	arrows: dataArrow,
	              	nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
	              	slidesToShow: dataRows,
	              	slidesToScroll: dataRows,
	              	rtl: window.rtl_slick,
	              	responsive: [
	                {
	                  	breakpoint: 1200,
	                  	settings: {
							get slidesPerRow() {
							    if (dataSlideRow == 2) {
									this.slidesPerRow = 1,
									this.rows = 2
							    }
							},
							get slidesToScroll() {
							    if (dataSlideRow == 1) {
									return this.slidesToScroll = 4
							    }
							},
							get slidesToShow() {
								if (dataMode == true) {
									return this.slidesToScroll = 2
								} else {
									return this.slidesToScroll = 4
								}
							}
	                  	}
	                },
	                {
	                  	breakpoint: 992,
	                  	settings: {
							get slidesPerRow() {
							    if (dataSlideRow == 2) {
									this.slidesPerRow = 1,
									this.rows = 2
							    }
							},
							get slidesToScroll() {
							    if (dataSlideRow == 1) {
									return this.slidesToScroll = 3
							    }
							},
							get slidesToShow() {
								if (dataMode == true) {
									return this.slidesToScroll = 2
								} else {
									return this.slidesToScroll = 3
								}
							}
		                }
	                },
	                {
	                  	breakpoint: 768,
	                  	settings: {
		                  	get slidesPerRow() {
							    if (dataSlideRow == 2) {
									this.slidesPerRow = 1,
									this.rows = 2
							    }
							},
							get slidesToScroll() {
							    if (dataSlideRow == 1) {
									return this.slidesToScroll = 1
							    }
							},
							get slidesToShow() {
								if (dataMode == true) {
									return this.slidesToScroll = 1
								} else {
									return this.slidesToScroll = 2
								}
							}
	                  	}
	                }                                          
	              ]
	            });
	        });
	    }
	}
	halo.initInstagramSlider();
})(jQuery);