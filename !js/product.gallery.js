(function ($) {
    "use strict";
    $.product_gallery = {
        options: {},
        init: function (options) {
            this.options = options;
            this.initGalleryClick();
            this.initElevateZoom();


            if (this.options.zoomDisable) {
                var ez = $('#zoom_01').data('elevateZoom');
                ez.changeState('disable');
                $('.zoomContainer').hide();
            } else {
                $(window).resize(this.zoomResize).resize();
            }

            if (!this.options.swipeboxDisable) {
                this.initSwipebox();
            }

        },
        initGalleryClick: function () {
            $('#gallery_01 a').click(function () {
                if ($(this).attr('id') == 'product-image-video') {
                    $('.image-image').hide();
                    $('.image-video').show();

                } else {
                    $('.image-image').show();
                    $('.image-video').hide();
                }
                $('#gallery_01 a').removeClass('active');
                $(this).addClass('active');
                return false;
            });
        },
        initElevateZoom: function () {
            $("#zoom_01").elevateZoom({
                zoomWindowWidth: 300,
                zoomWindowHeight: 300,
                gallery: '#gallery_01 a.elevate-zoom-thumbnail',
                cursor: 'pointer',
                galleryActiveClass: 'active',
                imageCrossfade: true,
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 500,
                lensFadeIn: 500,
                lensFadeOut: 500,
                loadingIcon: this.options.wa_parent_theme_url + 'img/icons/progress.gif'
            }).load(function () {
                $(this).removeAttr('style');
                $('.zoomWrapper').css({
                    'width': $(this).width(),
                    'height': $(this).height()
                });
            });
        },
        initSwipebox: function () {
            var zoomimages = [];
            var images = [];
            $('.thumbnail').each(function () {
                zoomimages.push({
                    'href': $(this).data('zoom-image'),
                    'title': $(this).attr('title')
                });
                images.push($(this).data('image'));
            });
            $("#zoom_01").on("click", function (e) {
                var index = images.indexOf($(this).attr('src'));
                $.swipebox(zoomimages, {
                    initialIndexOnArray: index
                });
                return false;
            });
        },
        zoomResize: function () {
            var ez = $('#zoom_01').data('elevateZoom');
            if ($(document).width() > 767) {
                ez.changeState('enable');
                $('.zoomContainer').show();
            } else {
                ez.changeState('disable');
                $('.zoomContainer').hide();
            }
        }

    };
})(jQuery);