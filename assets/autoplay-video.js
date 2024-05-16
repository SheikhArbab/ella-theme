(function ($) {
	var halo = {
	    sectionVideo: function () {
            var slickSlideshow = $('.video-section');
            if (slickSlideshow.length) {
                const loadVideo = slickSlideshow.each((index, element) => {
                    var $block = $(element);
                    const postVideo = function postMessageToPlayer(player, command) {
                        if (player == null || command == null) return;
                        player.contentWindow.postMessage(JSON.stringify(command), "*");
                    }
                    var player = $block.find('.js-youtube').get(0);
                    postVideo(player, {
                        "event": "command",
                        "func": "playVideo"
                    });
                    
              });

              window.addEventListener('load', () => {
                    loadVideo();
                    window.addEventListener('scroll', loadVideo);
              });
            };
        }
	}
	halo.sectionVideo();
})(jQuery);
