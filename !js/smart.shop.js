function showMsg(content, type) {
    if (type === undefined) {
        type = 'success';
    }
    noty({
        text: content,
        type: type,
        dismissQueue: true,
        layout: 'bottomLeft',
        closeWith: ['click'],
        maxVisible: 5,
        theme: 'relax',
        timeout: 5000,
        animation: {
            open: 'animated bounceInLeft',
            close: 'animated bounceOutLeft',
            easing: 'swing',
            speed: 500
        }
    });
}
function initCompare() {
    $('#content').on('click', '.compare-add', function () {
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare = compare.split(',');
        } else {
            compare = [];
        }
        var info = $(this).closest('.product-thumb').find('.ajax_product_info');
        var i = $.inArray($(this).data('id') + '', compare);
        if (i == -1) {
            compare.push($(this).data('id'));
            var url = compare_url.replace(/compare\/.*$/, 'compare/' + compare.join(',') + '/');
            showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + url + '">Список сравнения</a>');
        } else {
            compare.splice(i, 1);
            var url = compare_url.replace(/compare\/.*$/, 'compare/' + compare.join(',') + '/');
            showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> удален из <a href="' + url + '">Списка сравнения</a>', 'warning');
        }
        $('.compare-total').attr('href', url);
        $('.compare-total .count').text(compare.length);


        if (compare.length > 0) {
            $.cookie('shop_compare', compare.join(','), {expires: 30, path: '/'});
        } else {
            $.cookie('shop_compare', null, {expires: 30, path: '/'});
        }
        return false;
    });
}

function initWishlist() {
    $('#content').on('click', '.wishlist-add', function () {
        var wishlist = $.cookie('shop_wishlist');
        if (wishlist) {
            wishlist = wishlist.split(',');
        } else {
            wishlist = [];
        }
        var info = $(this).closest('.product-thumb').find('.ajax_product_info');
        var i = $.inArray($(this).data('id') + '', wishlist);
        if (i == -1) {
            wishlist.push($(this).data('id'));
            showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + wishlist_url + '">Избранное</a>');
        } else {
            wishlist.splice(i, 1);
            showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> удален из <a href="' + wishlist_url + '">Избранного</a>', 'warning');
        }
        $('.wishlist-total .count').text(wishlist.length);

        if (wishlist.length > 0) {
            $.cookie('shop_wishlist', wishlist.join(','), {expires: 30, path: '/'});
        } else {
            $.cookie('shop_wishlist', null, {expires: 30, path: '/'});
        }
        return false;
    });
}

function initRangeSlider() {
    $('.range_slider').each(function () {
        if (!$(this).find('.slider-range').length) {
            var self = $(this);
            var slider_range = $('<div class="slider-range"></div>').appendTo(self);
            var min_input = $(this).find('input[name="' + $(this).data('name-min') + '"]');
            var max_input = $(this).find('input[name="' + $(this).data('name-max') + '"]');
            slider_range.slider({
                range: true,
                min: self.data('min'),
                max: self.data('max'),
                values: [min_input.val() ? min_input.val() : self.data('min'), max_input.val() ? max_input.val() : self.data('max')],
                slide: function (event, ui) {
                    var v = ui.values[0] == $(this).slider('option', 'min') ? '' : ui.values[0];
                    min_input.val(v);
                    v = ui.values[1] == $(this).slider('option', 'max') ? '' : ui.values[1];
                    max_input.val(v);
                },
                stop: function (event, ui) {
                    min_input.change();
                }
            });
            min_input.add(max_input).change(function () {
                var min_val = min_input.val() === '' ? slider_range.slider('option', 'min') : parseFloat(min_input.val());
                var max_val = max_input.val() === '' ? slider_range.slider('option', 'max') : parseFloat(max_input.val());
                if (max_val >= min_val) {
                    slider_range.slider('option', 'values', [min_val, max_val]);
                }
            });
        }
    });
}

$(document).ready(function () {
    $(document).on('click', '.quick-view', function () {
        var d = $('#dialog');
        var c = $('<div class="product-info"></div>');
        c.html('<i class="icon32 loading"><i>');
        d.find('.content').html(c);
        c.load($(this).attr('href') + '?cart=1&quick_view=1', function () {
            c.prepend('<a href="#" class="dialog-close"><i class="fa fa-times" aria-hidden="true"></i></a>');
        });
        d.show();
        $('html').addClass('dialog-open');
        return false;
    });
    $(document).on('click', '.product-image-next', function () {
        var img = $(this).closest('.image').find('img');
        var images = $(this).closest('.product-image-buttons').data('images');
        var index = images.indexOf(img.attr('src'));
        if (index < images.length - 1) {
            index++;
        } else {
            index = 0;
        }
        img.hide();
        img.after('<i class="icon16 loading"><i>');
        img.attr('src', images[index]);
        img.one('load', function () {
            $(this).next('.loading').remove();
            $(this).show();
        });
        return false;
    });
    $(document).on('click', '.product-image-prev', function () {
        var img = $(this).closest('.image').find('img');
        var images = $(this).closest('.product-image-buttons').data('images');
        var index = images.indexOf(img.attr('src'));
        if (index > 0) {
            index--;
        } else {
            index = images.length - 1;
        }
        img.attr('src', images[index]);
        return false;
    });
    $('#clear-wishlist').click(function () {
        $.cookie('shop_wishlist', '', {expires: 0, path: '/'});
        location.reload();
        return false;
    });
    $("#currency a").click(function () {
        var url = location.href;
        if (url.indexOf('?') == -1) {
            url += '?';
        } else {
            url += '&';
        }
        location.href = url + 'currency=' + $(this).data('code');
        return false;
    });

    $(".option_box .option_name").click(function () {
        var filter = $.cookie('shop_filter_collapsible');
        if (filter) {
            filter = filter.split(',');
        } else {
            filter = [];
        }
        var i = $.inArray($(this).data('filter') + '', filter);
        if ($(this).hasClass('hided') && i != -1) {
            filter.splice(i, 1);
        } else if (!$(this).hasClass('hided') && i == -1) {
            filter.push($(this).data('filter'));
        }

        if (filter.length > 0) {
            $.cookie('shop_filter_collapsible', filter.join(','), {expires: 30, path: '/'});
        } else {
            $.cookie('shop_filter_collapsible', null, {expires: 30, path: '/'});
        }

        $(this).siblings(".collapsible").toggle();
        $(this).toggleClass("hided");
    });

    $('.filters.ajax input').change(function () {
        var f = $(this).closest('.filters.ajax');
        var url = '?' + f.serialize();
        $('.products-category .product-thumb').append('<div class="loadmask"></div>');

        $.get(url + '&_=_', function (html) {
            var tmp = $('<div></div>').html(html);
            $('.products-category').html(tmp.find('.products-category').html());
            $('.products-category img[data-original]').lazyload({
                effect: "fadeIn"
            });
            $('.pagination-block').html(tmp.find('.pagination-block').html());
            $('#input-sort').html(tmp.find('#input-sort').html());
            initLazyLoad();
            if (localStorage.getItem('display') == 'list') {
                $('#list-view').trigger('click');
            } else {
                $('#grid-view').trigger('click');
            }
            if (!!(history.pushState && history.state !== undefined)) {
                window.history.pushState({}, '', url);
            }
        });
    });




    initCompare();
    initWishlist();

    $('#input-sort').change(function () {
        location.assign($(this).val());
    });

    $('#input-limit').change(function () {
        if ($(this).val()) {
            $.cookie('products_per_page', $(this).val(), {expires: 30, path: '/'});
        } else {
            $.cookie('products_per_page', '', {expires: 0, path: '/'});
        }
        location.reload();
    });


    $("#content").on('submit', 'form.addtocart', function () {
        var f = $(this);
        var loading = $('<div class="button-overlay"><i class="icon16 loading"></i></div>');
        if (f.data('url')) {
            $(this).find('button').append(loading);
            var d = $('#dialog');
            var c = $('<div class="product-info"></div>');
            c.html('<i class="icon32 loading"><i>');
            d.find('.content').html(c);
            c.load(f.data('url'), function () {
                loading.remove();
                c.prepend('<a href="#" class="dialog-close"><i class="fa fa-times" aria-hidden="true"></i></a>');
            });
            d.show();
            $('html').addClass('dialog-open');
            return false;
        }

        $(this).find('button').append(loading);
        $.post(f.attr('action') + '?html=1', f.serialize(), function (response) {
            loading.remove();
            if (response.status == 'ok') {
                var cart_total = $("#cart-total");
                var origin = f.closest('.product-thumb');
                var info = origin.find('.ajax_product_info');
                showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + cart_url + '">корзину</a>');
                $('#cart').addClass('open');

                var block = $('<div></div>').append(origin.html());
                var topTo = cart_total.offset().top;
                if ($(window).scrollTop() > cart_total.offset().top) {
                    topTo = $(window).scrollTop();
                }
                block.css({
                    'z-index': 10,
                    top: origin.offset().top,
                    left: origin.offset().left,
                    width: origin.width() + 'px',
                    height: origin.height() + 'px',
                    position: 'absolute',
                    overflow: 'hidden'
                }).appendTo('body').animate({
                    top: topTo,
                    left: cart_total.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.5
                }, 500, function () {
                    $(this).remove();
                    cart_total.html(response.data.total);

                    var cart_item = $('#cart .cart-items tr[data-id=' + response.data.item_id + ']');
                    var quantity = 1;
                    if (cart_item.length) {
                        quantity = parseInt(cart_item.find('.quantity').text()) + quantity;
                        cart_item.find('.quantity').text(quantity);
                    } else {

                        var tpl_data = {
                            url: info.data('url'),
                            name: info.data('name'),
                            truncate_name: info.data('truncate-name'),
                            img: info.data('img'),
                            price: info.data('price'),
                            quantity: quantity,
                            id: response.data.item_id
                        };
                        $('#cart_item_tmpl').tmpl(tpl_data).appendTo('#cart .cart-items table tbody');
                        $('#cart .cart-items').show();
                        $('#cart .cart-buttons').show();
                        $('#cart .cart-empty').hide();
                    }
                    if ($('table.cart').length) {
                        location.reload();
                    }
                });
                if (response.data.error) {
                    alert(response.data.error);
                }
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });


    function initLazyLoad() {
        //LAZYLOADING
        if ($.fn.lazyLoad) {

            var paging = $('.lazyloading-paging');
            if (!paging.length) {
                return;
            }
            // check need to initialize lazy-loading
            var current = paging.find('li.selected');
            if (current.children('a').text() != '1') {
                return;
            }
            paging.hide();
            var loading_str = paging.data('loading-str') || 'Loading...';
            var win = $(window);

            // prevent previous launched lazy-loading
            win.lazyLoad('stop');

            // check need to initialize lazy-loading
            var next = current.next();
            if (next.length) {
                win.lazyLoad({
                    container: '.products-category',
                    load: function () {
                        win.lazyLoad('sleep');

                        var paging = $('.lazyloading-paging').hide();

                        // determine actual current and next item for getting actual url
                        var current = paging.find('li.selected');
                        var next = current.next();
                        var url = next.find('a').attr('href');
                        if (!url) {
                            win.lazyLoad('stop');
                            return;
                        }

                        var product_list = $('.products-category');
                        var loading = paging.parent().find('.loading').parent();
                        if (!loading.length) {
                            loading = $('<div><i class="icon16 loading"></i>' + loading_str + '</div>').insertBefore(paging);
                        }

                        loading.show();
                        $.get(url, function (html) {
                            var tmp = $('<div></div>').html(html);
                            if ($.Retina) {
                                tmp.find('.product-list img').retina();
                            }
                            if (img_lazyload) {
                                tmp.find('.product-list img[data-original]').lazyload({
                                    effect: "fadeIn"
                                });
                            }
                            product_list.append(tmp.find('.products-category').children());
                            if (localStorage.getItem('display') == 'list') {
                                $('#list-view').trigger('click');
                            } else {
                                $('#grid-view').trigger('click');
                            }
                            var tmp_paging = tmp.find('.lazyloading-paging').hide();
                            paging.replaceWith(tmp_paging);
                            paging = tmp_paging;

                            // check need to stop lazy-loading
                            var current = paging.find('li.selected');
                            var next = current.next();
                            if (next.length) {
                                win.lazyLoad('wake');
                            } else {
                                win.lazyLoad('stop');
                            }

                            loading.hide();
                            tmp.remove();
                        });
                    }
                });
            }

        }
    }
    initLazyLoad();

});
