"use strict";

var commonModule = (function() {
    let self = this;
    if (typeof window !== 'undefined') {
        var $ = window.$;
    }
    function initSidebar() {
        var sidebar = function(){
            var $sidebar = $('.sidebar');

            var init = function () {
                //negotiate button in add-edit 
              
                //desktop sidebar button
                $('.sidebar-action').on('click', function (e) {
                    e.stopImmediatePropagation()
                    $sidebar.toggleClass('o-collapse');
                    $('body').toggleClass('sidebar-collapse');
                });

                //mobile sidebar button
                $("#toggle-mobile-menu").click(function(e) {
                    e.stopImmediatePropagation();
                    $sidebar.toggleClass('o-collapse');
                    $('body').toggleClass('sidebar-collapse');

                    
                    $(".header.mod li.h-extramenus ").slideUp();
                    $(".mobile_top_toggler > span").removeClass("_menu");
                    $(".mobile_top_toggler > span .fa-angle-down").removeClass("rotate");
                });

                $('.sidebar-nav > li.has-sub > a').on('click', function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    var $this = $(this);
                    var $li = $(this).parent();
                    
                    if( $li.hasClass('active') )
                    {
                        $li.find('ul').slideUp();
                        $li.removeClass('active');
                    }
                    else
                    {
                        $('.sidebar-nav > li.has-sub ul').slideUp();
                        $li.find('ul').slideDown();
                        $('.sidebar-nav > li.has-sub').removeClass('active');
                        $li.addClass('active');
                    }
                });
            }

            return {
                init: init
            }
        }

        function isMobile() {
            if ($(window).width() <= 767) {
                return true;
            }

            return false;
        }

        if ($('.page-sidebar').length) {
            sidebar().init();
        }
    }

    
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function initSelectLanguages() {
        /*language menu */
        $(function() {
            var ddlData = [
                { text: "EN", value: 1, imageSrc: "/assets/images/gb.svg" },
                { text: "CN", value: 2, imageSrc: "/assets/images/cn.svg" },
                { text: "FR", value: 3, imageSrc: "/assets/images/fr.svg" }
            ];

            //$('#SelectLanguage').ddslick({ data: ddlData, width: "auto", imagePosition: "left", onSelected: function (selectedData) { } });
        });

        /*auto scroll*/
        $('#SelectLanguage .dd-options, .header ul.st-parent, .header .st-subcat, .fs-scroll, .fsc-ul-cat, ul.h-dd-menu').niceScroll({ cursorcolor: "#000", zindex: "99999999", cursorwidth: "6px", cursorborderradius: "5px", cursorborder: "1px solid transparent", touchbehavior: true });

        $("ul.st-parent li").each(function() {
            var $this = $(this);
            $this.find('a').on('click', function() {
                event.preventDefault();
                $(this).siblings('.st-subcat').show();
            });
            if ($this.hasClass("back")) {
                $(this).find("i").on('click', function() {
                    event.preventDefault();
                    $(this).closest(".st-subcat").hide();
                });
            }
        });

        /*search sidebar category*/
        var $parentCatHeight = $(".fsc-categories .st-parent").innerHeight();
        $(".fsc-categories .st-subcat").css("min-height", $parentCatHeight + "px");

    }

    /*number only*/
    function isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 46 && charCode > 31
            && (charCode < 48 || charCode > 57))
            return false;

        return true;
    }

    /*validate fields*/
    function validateFields(selector) {
        var error = false;
        if (!selector) {
            selector = '.required';
        }

        $(selector).each(function() {
            var $this = $(this);
            if ($this.val().trim() == "") {
                $this.addClass("error-con");
                error = true;
            } else {
                $this.removeClass("error-con");
            }
        });
        return error;
    }

    function validateBlurFields() {
        $(".required").each(function() {
            var $this = $(this);
            $this.blur(function() {
                if ($this.val() == "") {
                    $this.addClass("error-con");
                } else {
                    $this.removeClass("error-con");
                }
            });
        });
    }
    function splitDate(date) {
        var parts = date.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function validateDateComparison(dateRange) {

        if (splitDate(dateRange) > splitDate(dateRange)) {
            return false;
        }

        else if (!dateRange || !dateRange) {

            return false;
        }

        else
            return true;
    }


    function windowsOnLoad() {
        $(window).on('load', function() {

            alignVertical();
            onSizefixed();
            $(window).on('scroll', function() {
                alignVertical();
                onSizefixed();
            });

            /*add padding-top on main class*/
            var $headerHeight = $(".header").innerHeight();
            $(".main").css("padding-top", $headerHeight + "px");
            var $hheaderHeight = $(".header").innerHeight() - 30;
            $(".page-home .main").css("padding-top", $hheaderHeight + "px");

            /*search page*/
            if ($(window).width() <= 768) {
                if ($("body").hasClass("page-search")) {
                    // $(".fixed-sidebar").removeClass("open");
                    // $(".search-container").removeClass("open-sidebar");
                }
            }
            
            // seller pages mobile menu
            $("#toggle-mobile-menu").click(function() {
                $(".header-top ul.header-menus.tog").slideToggle();
            });

            $('.percentCheckerCustom').on('keyup', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9\.\,]/g, '');
                //  var parseValue = parseFloat(this.value);
                //  this.value = parseValue.toFixed(2);
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (100 < parseInt(this.value)) {
                    toastr.error("Maximum percentage value is 100%", "Invalid Value");
                    $(this).addClass('error-con');
                    return;
                }

            });

            $('.numbersOnly').on('keyup', function () { this.value = this.value.replace(/[^0-9\.|/]/g, ''); });

            $('.numbersOnlyd').on('keyup', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9]/g, '');
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (parseInt($(this).attr('data-max'))) {
                    if (parseInt($(this).attr('data-max')) < parseInt(this.value)) {
                        toastr.error("Maximum value is " + $(this).attr('data-max'), "Invalid Value");
                        $(this).addClass('error-con');
                        return;
                    }
                }
                if (parseInt($(this).attr('data-min'))) {
                    if (parseInt($(this).attr('data-min')) > parseInt(this.value)) {
                        toastr.error("Minimum value is " + $(this).attr('data-min'), "Invalid Value");
                        $(this).addClass('error-con');
                        return;
                    }
                }
            });
            $('.numbersOnlyD').on('keyup blur', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9\.\,]/g, '');
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (parseFloat($(this).attr('data-max'))) {
                    if (parseFloat($(this).attr('data-max')) < parseFloat(this.value)) {
                        toastr.error("Maximum value is " + $(this).attr('data-max'), "Invalid Value");
                        $(this).addClass('error-con');
                        return;
                    }
                }
                if (parseFloat($(this).attr('data-min'))) {
                    if (parseFloat($(this).attr('data-min')) > parseFloat(this.value)) {
                        toastr.error("Minimum value is " + $(this).attr('data-min'), "Invalid Value");
                        $(this).addClass('error-con');
                        return;
                    }
                }
            });
            $('.numberDecimalOnly').on('keyup', function() { this.value = this.value.replace(/[^0-9\.]/g, ''); });

            $('.phoneNumber').on('keyup', function () { this.value = this.value.replace(/[\+]?[0-9 ]/g, ''); });

            $('.phoneOnly').on('keyup', function () { this.value = this.value.replace(/[^0-9.+() ]/g, ''); });

            $('.charOnly').on('keyup', function () { this.value = this.value.replace(/[^A-Za-z]/g, ''); });

            $('.alphanumericOnly').on('keyup', function () { this.value = this.value.replace(/[^A-Za-z0-9]/g, ''); });

            $('.alphanumericAndSpaceOnly').on('keyup', function () { this.value = this.value.replace(/[^A-Za-z0-9 ]/g, ''); });

            $('.currencyOnly').on('keyup', function () { this.value = this.value.replace(/[^0-9.]/g, ''); });

            $('.charspaceOnly').on('keyup', function () { this.value = this.value.replace(/[^A-Za-z ]/g, ''); });

            $('.domainChars').on('keyup', function () { this.value = this.value.replace(/[^A-Za-z0-9\.-]/g, ''); });

            //$('.emailOnly').on('focusout', function () {

            //    $(this).removeClass('error-con');

            //    if ($(this).val() == "" && !$(this).hasClass('required') && $(this).find('[data-is-mandatory="true"]').length <= 0) {
            //        return false;
            //    }
            //    var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
            //    if (!regex.test($(this).val())) {
            //        $(this).addClass('error-con');
            //    }
            //});

            //Story ARC7190
            $('.emailOnlyForContactUsAdmin').on('focusout', function() {

                $(this).removeClass('error-con');

                if ($(this).val() == "" && !$(this).hasClass('required') && $(this).find('[data-is-mandatory="true"]').length <= 0) {
                    return false;
                }
                var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
                if (!regex.test($(this).val())) {
                    $(this).addClass('error-con');
                    if ($(this).val() == "") {
                        $(this).removeClass('error-con');
                    }
                }
            });

            $(document).on('keypress', '.numbersOnly', function(e) {
                if ((e.which < 48 || e.which > 57)) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.numberDecimalOnly', function(e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.numberDecimalOnly100Percent', function (e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                }
            });

            $(document).on('keydown', '.numberDecimalOnly100Percent', function (e) {
                var input = this.value;
                let total = e.target.value + e.key;

                if (parseFloat(total) > 100) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.number2DecimalOnly', function(e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                } else {
                    if (e.which == 46 && input === '') {
                        e.target.value = '0.'
                    }
                }
            });

            $(document).on('keyup', '.number2DecimalOnly', function(e) {
                var input = this.value.replace(/[^0-9\.]/g, '');
                var arr = input.split('.');
                if (arr.length > 2) {
                    input = arr[0] + '.' + arr[1];
                    arr = input.split('.');
                }
                if (input === '.') {
                    input = '';
                } else {
                    if (typeof arr[1] !== 'undefined' && arr[1].length > 2) {
                        arr[1] = arr[1].substr(0, 2);
                    }
                    input = arr[0];
                    if (typeof arr[1] !== 'undefined') {
                        input = input + '.' + arr[1];
                    }
                }
                this.value = input;
            });

            $(document).on('focusout', '.number2DecimalOnly', function(e) {
                var input = this.value;
                var pattern = new RegExp(/^(?=.*[0-9])\d*.$/i);
                if (pattern.test(input)) {
                    this.value = input.replace('.', '')
                }
            });

            function setGoogleMap(sender) {
                var txtLocation = $(sender);
                var ifMap = $(txtLocation.parent()).find('#embed-map-display').children('iframe');
                var ifMapSrc = ifMap.attr("src");
                if (txtLocation.val().trim() !== '') {
                    var newSrc = ifMapSrc.substr(0, ifMapSrc.indexOf('?q=') + 3) + txtLocation.val() + ifMapSrc.substr(ifMapSrc.indexOf('&'));
                    if (ifMapSrc != newSrc) {
                        ifMap.attr("src", newSrc);
                    }
                }
            }

            $(document).on('onBlur', '.location-value', function (sender) {
                var txtLocation = $(sender);
                var ifMap = $(txtLocation.parent()).find('#embed-map-display').children('iframe');
                var ifMapSrc = ifMap.attr("src");
                if (txtLocation.val().trim() !== '') {
                    var newSrc = ifMapSrc.substr(0, ifMapSrc.indexOf('?q=') + 3) + txtLocation.val() + ifMapSrc.substr(ifMapSrc.indexOf('&'));
                    if (ifMapSrc != newSrc) {
                        ifMap.attr("src", newSrc);
                    }
                }
            });

            function location_onKeyDown(e, sender) {
                var key = e.keyCode || e.which;
                if (key == 13) {
                    setGoogleMap(sender);
                }
            }

        });

        $(".sc-upper ul.st-parent li").each(function(){
            var $this = $(this);
            $this.find('a').click(function(){
                $(this).siblings('.st-subcat').show();
                $(this).siblings('.st-subcat').toggleClass('active');
    
                $(this).parents('ul:eq(0)').css('height' , $(this).next('ul').height() );
                /*$(".h-st-menus ul.st-parent:eq(0)").css('height' , $(this).next('ul').height() );*/
                // $(".st-subcat.active").each(function(){
                // 	var sibHeight = $(this).height();
                // 	$("ul.st-parent").css('height' , sibHeight);
                // });
            });
            
            if ($this.hasClass("back")) {
                $(this).find("i").click(function (e) {
                    e.preventDefault();
                    $(".sc-upper ul.st-parent , .sc-upper .st-subcat").css('height' , "auto");
                    $(this).closest(".st-subcat").hide();
                    if( $(this).parents('ul:eq(0)').parents('ul:eq(0)').length ) {
                        $(".sc-upper .h-st-menus ul.st-parent:eq(0)").css('height' ,  $(this).parents('ul:eq(0)').parents('ul:eq(0)').height() + 'px' );	
    
                    }
                });
            }
            
        });

        $("#itemNewPrice").on("change", function() {
            this.value = parseFloat(this.value).toFixed(2);
        });

        $( "#itemNewPrice" ).blur(function() {
            this.value = parseFloat(this.value).toFixed(2);
        });
    }

    function alignVertical() {
        $('.align-vertical').each(function() {
            var that = $(this);
            var height = that.height();
            var parentHeight = that.parent().height();
            var padAmount = (parentHeight / 2) - (height / 2);
            that.css('padding-top', padAmount);
        });
    }

    function onSizefixed() {
        var maxHeight = $(window).height();
        var minHeight = $(document).height();
        //if (maxHeight >= minHeight) {
        if (maxHeight > minHeight) {
            $(".footer").addClass("fixed");
        } else {
            //$(".footer").removeClass("fixed");
        }
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function AsciiToText(text) {
        var parser = new DOMParser;
        var dom = parser.parseFromString(text, 'text/html');
        var decodedString = dom.body.textContent;
        return (decodedString);
    }

    function getCookie2(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split(';');
        var hadCookie = 0;
        //if (parts.length === 2) return parts.pop().split(';').shift();
        if (parts) {
            if (name === 'acceptCookiePolicy') {
                parts.forEach(function (c) {
                    if (c.includes('acceptCookiePolicy')) {
                        hadCookie = 1;
                    }
                });
            }
            if (name === 'guestUserID') {
                parts.forEach(function (c) {
                    if (c.includes('guestUserID')) {
                        if (c.length > 1) {
                            let disect = c.split('=');
                            disect.forEach(function (d) {
                                hadCookie = d;
                            });
                        }

                    }
                });

            }
        }
        return hadCookie
    }

    function createCookie(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    function eraseCookie(name) {
        createCookie(name, "", -1);
    }

    function changeFavicon(src) {
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = src;
        if (oldLink) {
            document.head.removeChild(oldLink);
        }
        document.head.appendChild(link);
    }

    function getGlobalDateFormatSettings(withTime, isPlaceholder) {

        var systemSettings = $('.date-format-settings-container').val()
        var sSettings = JSON.parse(systemSettings);
        var day = sSettings[0].day;
        var month = sSettings[1].month;
        var year = sSettings[2].year;

        var defaultFormat = 'DD/MM/YYYY';
        var defaultTime = 'HH:mm:ss';

        var format = "";
        if (year == "--") {
            format = `${day}/${month}`
        }
        else {
            format = `${day}/${month}/${year}`
        }

        if (withTime) {
            format = `${format} ${defaultTime}`
            defaultFormat = `${defaultFormat} ${defaultTime}Z`
        }

        format = format.replace("O", "o");

        if (isPlaceholder && isPlaceholder == true) {
            format = format.toUpperCase();
        }

        return format

    }

    function guidGenerator() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    return {
        init: function() {
            unbindEvents();
            windowsOnLoad();
            //initSelectLanguages();
        },
        initSidebar: initSidebar,
        validateFields: validateFields,
        validateBlurFields: validateBlurFields,
        isNumberKey: isNumberKey,
        numberWithCommas: numberWithCommas,
        validateDateComparison: validateDateComparison,
        validateEmail: validateEmail,
        splitDate: splitDate,
        getCookie: getCookie,
        createCookie: createCookie,
        eraseCookie: eraseCookie,
        changeFavicon: changeFavicon,
        initHeaderMenuScroll: function () {
            $('ul.h-dd-menu').niceScroll({ cursorcolor: "#b3b3b3", zindex: "99999999", cursorwidth: "6px", cursorborderradius: "5px", cursorborder: "1px solid transparent", touchbehavior: true });
        },
        getGlobalDateFormatSettings: getGlobalDateFormatSettings,
        guidGenerator: guidGenerator
    };

    function unbindEvents() {
        $('.percentCheckerCustom').off("keyup");
        $('.numbersOnly').off("keyup");
        $('.numbersOnlyd').off("keyup");
        $('.numbersOnlyD').off("keyup");
        $('.numberDecimalOnly').off("keyup");
        $('.phoneNumber').off("keyup");
        $('.phoneOnly').off("keyup");
        $('.charOnly').off("keyup");
        $('.alphanumericOnly').off("keyup");
        $('.alphanumericAndSpaceOnly').off("keyup");
        $('.currencyOnly').off("keyup");
        $('.charspaceOnly').off("keyup");
        $('.domainChars').off("keyup");
        $('.emailOnly').off("keyup");
    }

})();

module.exports = commonModule;
