function showMsg(content) {
    if ($('.alert').length) {
        $('.alert .close').trigger('click');
    }
    $('<div class="alert alert-success">' + content + '<button data-dismiss="alert" class="close" type="button">×</button></div>').prependTo('#container > .container:first-child');
    $('html, body').animate({scrollTop: 0}, 'slow');
}
function initCompare() {
    $('#content').on('click', '.compare-add', function () {
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare = compare.split(',');
        } else {
            compare = [];
        }
        var i = $.inArray($(this).data('id') + '', compare);
        if (i == -1) {
            compare.push($(this).data('id'));
        }
        var url = compare_url.replace(/compare\/.*$/, 'compare/' + compare.join(',') + '/');
        $('.compare-total').attr('href', url);
        $('.compare-total .count').text(compare.length);
        var info = $(this).closest('.product-thumb').find('.ajax_product_info');
        showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + url + '">Список сравнения</a>');


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
        var i = $.inArray($(this).data('id') + '', wishlist);
        if (i == -1) {
            wishlist.push($(this).data('id'));
        }
        $('.wishlist-total .count').text(wishlist.length);
        var info = $(this).closest('.product-thumb').find('.ajax_product_info');
        showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + wishlist_url + '">Избранное</a>');

        if (wishlist.length > 0) {
            $.cookie('shop_wishlist', wishlist.join(','), {expires: 30, path: '/'});
        } else {
            $.cookie('shop_wishlist', null, {expires: 30, path: '/'});
        }
        return false;
    });
}

$(document).ready(function () {
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
        var f = $(this);
        var url = '?' + f.serialize();
        $('.products-category .product-thumb').append('<div class="loadmask"></div>');

        $.get(url + '&_=_', function (html) {
            var tmp = $('<div></div>').html(html);
            $('.products-category').html(tmp.find('.products-category').html());
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

    $('.price_slider').each(function () {
        if (!$(this).find('.slider-range').length) {
            var self = $(this);
            var slider_range = $('<div class="slider-range"></div>').appendTo(self);
            var min_input = $('input[name="' + $(this).data('name-min') + '"]');
            var max_input = $('input[name="' + $(this).data('name-max') + '"]');
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

    $('.dialog').on('click', 'a.dialog-close', function () {
        $(this).closest('.dialog').hide().find('.content').empty();
        return false;
    });

    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            $(".dialog:visible").hide().find('.content').empty();
        }
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
                c.prepend('<a href="#" class="dialog-close">&times;</a>');
            });
            d.show();
            return false;
        }

        $(this).find('button').append(loading);
        $.post(f.attr('action') + '?html=1', f.serialize(), function (response) {
            loading.remove();
            if (response.status == 'ok') {
                var cart_total = $("#cart-total");
                if ($("table.cart").length) {
                    $(".content").parent().load(location.href, function () {
                        cart_total.html(response.data.total);
                    });
                } else {
                    var origin = f.closest('.product-thumb');
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
                            var info = origin.find('.ajax_product_info');
                            var tpl_data = {
                                url: info.data('url'),
                                name: info.data('name'),
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



                    });
                }
                if (response.data.error) {
                    alert(response.data.error);
                }
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });

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
                container: '#main > .content',
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

                    var product_list = $('#product-list .product-list');
                    var loading = paging.parent().find('.loading').parent();
                    if (!loading.length) {
                        loading = $('<div><i class="icon16 loading"></i>' + loading_str + '</div>').insertBefore(paging);
                    }

                    loading.show();
                    $.get(url, function (html) {
                        var tmp = $('<div></div>').html(html);
                        if ($.Retina) {
                            tmp.find('#product-list .product-list img').retina();
                        }
                        product_list.append(tmp.find('#product-list .product-list').children());
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
});
