function Product(form, options) {
    this.form = $(form);
    this.add2cart = this.form.find(".add2cart");
    this.button = this.add2cart.find("#button-cart");
    for (var k in options) {
        this[k] = options[k];
    }
    var self = this;

    // add to cart block: services
    this.form.find(".services input[type=checkbox]").click(function () {
        var obj = $('select[name="service_variant[' + $(this).val() + ']"]');
        if (obj.length) {
            if ($(this).is(':checked')) {
                obj.removeAttr('disabled');
            } else {
                obj.attr('disabled', 'disabled');
            }
        }
        self.updatePrice();
    });

    this.form.find(".services .service-variants").on('change', function () {
        self.updatePrice();
    });


    this.form.find(".skus input[type=radio]").click(function () {
        if ($(this).data('image-id')) {
            $("#product-image-" + $(this).data('image-id')).click();
        }
        if ($(this).data('disabled')) {
            self.button.attr('disabled', 'disabled');
        } else {
            self.button.removeAttr('disabled');
        }
        var sku_id = $(this).val();
        self.updateSkuServices(sku_id);
        self.updatePrice();
    });
    var $initial_cb = this.form.find(".skus input[type=radio]:checked:not(:disabled)");
    if (!$initial_cb.length) {
        $initial_cb = this.form.find(".skus input[type=radio]:not(:disabled):first").prop('checked', true).click();
    }
    $initial_cb.click();

    this.form.find('.inline-select a').click(function () {
        var d = $(this).closest('.inline-select');
        d.find('a.selected').removeClass('selected');
        $(this).addClass('selected');
        d.find('.sku-feature').val($(this).data('value')).change();
        return false;
    });

    this.form.find(".sku-feature").change(function () {
        var key = "";
        self.form.find(".sku-feature").each(function () {
            key += $(this).data('feature-id') + ':' + $(this).val() + ';';
        });
        var sku = self.features[key];
        if (sku) {
            if (sku.image_id) {
                $("#product-image-" + sku.image_id).click();
            }
            self.updateSkuServices(sku.id);
            if (sku.available) {
                self.button.removeAttr('disabled');
            } else {
                self.form.find("div.stocks div").hide();
                self.form.find(".sku-no-stock").show();
                self.button.attr('disabled', 'disabled');
            }
            self.add2cart.find("price-new").data('price', sku.price);
            self.updatePrice(sku.price, sku.compare_price);
        } else {
            self.form.find("div.stocks div").hide();
            self.form.find(".sku-no-stock").show();
            self.button.attr('disabled', 'disabled');
            self.add2cart.find(".price-old").hide();
            self.add2cart.find(".price-new").empty();
        }
    });
    this.form.find(".sku-feature:first").change();

    if (!this.form.find(".skus input:radio:checked").length) {
        this.form.find(".skus input:radio:enabled:first").attr('checked', 'checked');
    }

    this.form.submit(function () {
        var f = $(this);
        var loading = $('<div class="button-overlay"><i class="icon16 loading"></i></div>');
        $(this).find('#button-cart').append(loading);
        $.post(f.attr('action') + '?html=1', f.serialize(), function (response) {
            if (response.status == 'ok') {
                var cart_total = $("#cart-total");
                var cart_div = f;
                loading.remove();


                var clone = $('<div class="product-info"></div>').append(f.clone());
                var info = clone.find('.ajax_product_info');
                showMsg('<i class="fa fa-check-circle"></i> Товар <a href="' + info.data('url') + '">' + info.data('name') + '</a> успешно добавлен в <a href="' + cart_url + '">корзину</a>');
                $('#cart').addClass('open');

                if (cart_div.closest('.dialog').length) {
                    clone.insertAfter(cart_div.closest('.dialog'));
                } else {
                    clone.appendTo('body');
                }
                clone.css({
                    top: cart_div.offset().top,
                    left: cart_div.offset().left,
                    width: cart_div.width() + 'px',
                    height: cart_div.height() + 'px',
                    position: 'absolute',
                    overflow: 'hidden'
                }).animate({
                    top: cart_total.offset().top,
                    left: cart_total.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.5
                }, 500, function () {
                    clone.remove();
                    cart_total.html(response.data.total);
                    var cart_item = $('#cart .cart-items tr[data-id=' + response.data.item_id + ']');
                    var quantity = parseInt(cart_div.find('#input-quantity').val());
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
                if (cart_div.closest('.dialog').length) {
                    cart_div.closest('.dialog').trigger('close');
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

    this.form.find('.compare-add').click(function () {
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare = compare.split(',');
        } else {
            compare = [];
        }
        var info = self.form.find('.ajax_product_info');
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

    this.form.find('.wishlist-add').click(function () {
        var wishlist = $.cookie('shop_wishlist');
        if (wishlist) {
            wishlist = wishlist.split(',');
        } else {
            wishlist = [];
        }
        var i = $.inArray($(this).data('id') + '', wishlist);
        var info = self.form.find('.ajax_product_info');
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

Product.prototype.currencyFormat = function (number, no_html) {
    // Format a number with grouped thousands
    //
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +	 bugfix by: Michael White (http://crestidg.com)

    var i, j, kw, kd, km;
    var decimals = this.currency.frac_digits;
    var dec_point = this.currency.decimal_point;
    var thousands_sep = this.currency.thousands_sep;

    // input sanitation & defaults
    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if ((j = i.length) > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals && (number - i) ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


    var number = km + kw + kd;
    var s = no_html ? this.currency.sign : this.currency.sign_html;
    if (!this.currency.sign_position) {
        return s + this.currency.sign_delim + number;
    } else {
        return number + this.currency.sign_delim + s;
    }
};


Product.prototype.serviceVariantHtml = function (id, name, price) {
    return $('<option data-price="' + price + '" value="' + id + '"></option>').text(name + ' (+' + this.currencyFormat(price, 1) + ')');
};

Product.prototype.updateSkuServices = function (sku_id) {
    this.form.find("div.stocks div").hide();
    this.form.find(".sku-" + sku_id + "-stock").show();
    for (var service_id in this.services[sku_id]) {
        var v = this.services[sku_id][service_id];
        if (v === false) {
            this.form.find(".service-" + service_id).hide().find('input,select').attr('disabled', 'disabled').removeAttr('checked');
        } else {
            this.form.find(".service-" + service_id).show().find('input').removeAttr('disabled');
            if (typeof (v) == 'string') {
                this.form.find(".service-" + service_id + ' .service-price').html(this.currencyFormat(v));
                this.form.find(".service-" + service_id + ' input').data('price', v);
            } else {
                var select = this.form.find(".service-" + service_id + ' .service-variants');
                var selected_variant_id = select.val();
                for (var variant_id in v) {
                    var obj = select.find('option[value=' + variant_id + ']');
                    if (v[variant_id] === false) {
                        obj.hide();
                        if (obj.attr('value') == selected_variant_id) {
                            selected_variant_id = false;
                        }
                    } else {
                        if (!selected_variant_id) {
                            selected_variant_id = variant_id;
                        }
                        obj.replaceWith(this.serviceVariantHtml(variant_id, v[variant_id][0], v[variant_id][1]));
                    }
                }
                this.form.find(".service-" + service_id + ' .service-variants').val(selected_variant_id);
            }
        }
    }
};
Product.prototype.updatePrice = function (price, compare_price) {
    if (price === undefined) {
        var input_checked = this.form.find(".skus input:radio:checked");
        if (input_checked.length) {
            var price = parseFloat(input_checked.data('price'));
            var compare_price = parseFloat(input_checked.data('compare-price'));
        } else {
            var price = parseFloat(this.add2cart.find(".price-new").data('price'));
        }
    }
    if (compare_price) {
        if (!this.add2cart.find(".price-old").length) {
            this.add2cart.find(".price-new").before('<span class="price-old"></span>');
        }
        this.add2cart.find(".price-old").html(this.currencyFormat(compare_price)).show();
    } else {
        this.add2cart.find(".price-old").hide();
    }
    var self = this;
    this.form.find(".services input:checked").each(function () {
        var s = $(this).val();
        if (self.form.find('.service-' + s + '  .service-variants').length) {
            price += parseFloat(self.form.find('.service-' + s + '  .service-variants :selected').data('price'));
        } else {
            price += parseFloat($(this).data('price'));
        }
    });
    this.add2cart.find(".price-new").html(this.currencyFormat(price));
}

$(function () {
    if (typeof product_reviews_display_mode == 'undefined' || product_reviews_display_mode != 'product_page') {
        return false;
    }
    var loading = $('<div><i class="icon16 loading"></i></div>');
    $('#review')
            .append(loading)
            .load(product_url + 'reviews/ .reviews',
                    function () {
                        initFormControl($('#review'));

                        $('div.wa-captcha .wa-captcha-refresh, div.wa-captcha .wa-captcha-img').unbind('click').click(function () {
                            var div = $(this).parents('div.wa-captcha');
                            var captcha = div.find('.wa-captcha-img');
                            if (captcha.length) {
                                captcha.attr('src', captcha.attr('src').replace(/\?.*$/, '?rid=' + Math.random()));
                                captcha.one('load', function () {
                                    div.find('.wa-captcha-input').focus();
                                });
                            }
                            ;
                            div.find('input').val('');
                            return false;
                        });

                        /**
                         * Hotkey combinations
                         * {Object}
                         */
                        var hotkeys = {
                            'alt+enter': {
                                ctrl: false, alt: true, shift: false, key: 13
                            },
                            'ctrl+enter': {
                                ctrl: true, alt: false, shift: false, key: 13
                            },
                            'ctrl+s': {
                                ctrl: true, alt: false, shift: false, key: 17
                            }
                        };

                        var form_wrapper = $('#product-reivew-form');
                        var form = form_wrapper.find('form');
                        var content = $('.reviews');

                        var input_rate = form.find('input[name=rate]');
                        if (!input_rate.length) {
                            input_rate = $('<input name="rate" type="hidden" value=0>').appendTo(form);
                        }
                        $('#review-rate').rateWidget({
                            onUpdate: function (rate) {
                                input_rate.val(rate);
                            }
                        });

                        content.off('click', '.review-reply, .write-review a').on('click', '.review-reply, .write-review a', function () {
                            var self = $(this);
                            var item = self.parents('li:first');
                            var parent_id = parseInt(item.attr('data-id'), 10) || 0;
                            prepareAddingForm.call(self, parent_id);
                            return false;
                        });

                        var captcha = $('.wa-captcha');
                        var provider_list = $('#user-auth-provider li');
                        var current_provider = provider_list.filter('.selected').attr('data-provider');
                        if (current_provider == 'guest' || !current_provider) {
                            captcha.show();
                        } else {
                            captcha.hide();
                        }

                        provider_list.find('a').click(function () {
                            var self = $(this);
                            var li = self.parents('li:first');
                            if (li.hasClass('selected')) {
                                return false;
                            }
                            li.siblings('.selected').removeClass('selected');
                            li.addClass('selected');

                            var provider = li.attr('data-provider');
                            form.find('input[name=auth_provider]').val(provider);
                            if (provider == 'guest') {
                                $('div.provider-fields').hide();
                                $('div.provider-fields[data-provider=guest]').show();
                                captcha.show();
                                return false;
                            }
                            if (provider == current_provider) {
                                $('div.provider-fields').hide();
                                $('div.provider-fields[data-provider=' + provider + ']').show();
                                captcha.hide();
                                return false;
                            }

                            var left = (screen.width - 600) / 2;
                            var top = (screen.height - 400) / 2;
                            window.open(
                                    $(this).attr('href'), "oauth", "width=600,height=400,left=" + left + ",top=" + top + ",status=no,toolbar=no,menubar=no"
                                    );
                            return false;
                        });

                        addHotkeyHandler('textarea', 'ctrl+enter', addReview);
                        form.submit(function () {
                            addReview();
                            return false;
                        });

                        function addReview() {
                            $.post(
                                    location.href.replace(/\/#\/[^#]*|\/#|\/$/g, '') + '/reviews/add/',
                                    form.serialize(),
                                    function (r) {
                                        if (r.status == 'fail') {
                                            clear(form, false);
                                            showErrors(form, r.errors);
                                            return;
                                        }
                                        if (r.status != 'ok' || !r.data.html) {
                                            if (console) {
                                                console.error('Error occured.');
                                            }
                                            return;
                                        }
                                        var html = r.data.html;
                                        var parent_id = parseInt(r.data.parent_id, 10) || 0;
                                        var parent_item = parent_id ? form.parents('li:first') : content;
                                        var ul = $('ul.reviews-branch:first', parent_item);
                                        if (parent_id) {
                                            ul.show().append(html);
                                        } else {
                                            ul.show().prepend(html);
                                        }
                                        $('.reviews-count-text').text(r.data.review_count_str);
                                        $('.reviews-count').text(r.data.count);
                                        form.find('input[name=count]').val(r.data.count);
                                        clear(form, true);
                                        content.find('.write-review a').click();
                                        form_wrapper.hide();
                                        if (typeof success === 'function') {
                                            success(r);
                                        }
                                    },
                                    'json')
                                    .error(function (r) {
                                        if (console) {
                                            console.error(r.responseText ? 'Error occured: ' + r.responseText : 'Error occured.');
                                        }
                                    });
                        }
                        ;

                        function showErrors(form, errors) {
                            for (var name in errors) {
                                $('[name=' + name + ']', form).after($('<em class="errormsg"></em>').text(errors[name])).addClass('error');
                            }
                        }
                        ;

                        function clear(form, clear_inputs) {
                            clear_inputs = typeof clear_inputs === 'undefined' ? true : clear_inputs;
                            $('.errormsg', form).remove();
                            $('.error', form).removeClass('error');
                            $('.wa-captcha-refresh', form).click();
                            if (clear_inputs) {
                                $('input[name=captcha], textarea', form).val('');
                                $('input[name=rate]', form).val(0);
                                $('input[name=title]', form).val('');
                                $('.rate', form).trigger('clear');
                            }
                        }
                        ;

                        function prepareAddingForm(review_id)
                        {
                            var self = this; // clicked link
                            if (review_id) {
                                self.parents('.actions:first').after(form_wrapper);
                                $('.rate ', form).trigger('clear').parents('.review-field:first').hide();
                            } else {
                                self.parents('.write-review').after(form_wrapper);
                                form.find('.rate').parents('.review-field:first').show();
                            }
                            clear(form, false);
                            $('input[name=parent_id]', form).val(review_id);
                            form_wrapper.show();
                        }
                        ;

                        function addHotkeyHandler(item_selector, hotkey_name, handler) {
                            var hotkey = hotkeys[hotkey_name];
                            form.off('keydown', item_selector).on('keydown', item_selector,
                                    function (e) {
                                        if (e.keyCode == hotkey.key &&
                                                e.altKey == hotkey.alt &&
                                                e.ctrlKey == hotkey.ctrl &&
                                                e.shiftKey == hotkey.shift)
                                        {
                                            return handler();
                                        }
                                    }
                            );
                        }
                        ;
                    });
});