'use strict';
function template(bodyClass, title, body, app, reduxState) {
    let styles = [];
    let js = [];

    const styleCss = '<link href="/assets/css/style.css" rel="stylesheet" type="text/css" />';
    const responsiveCss = '<link href="/assets/css/responsive.css" rel="stylesheet" type="text/css" />';

    const canvasCropCss = '<link href="/assets/css/canvasCrop.css" rel="stylesheet" type="text/css" />';
    const bootstrapDateTimePickerCss = '<link href="/assets/css/bootstrap-datetimepicker.min.css" rel="stylesheet" type="text/css" />';
    const featureCss = '<link href="/assets/css/feature.css" rel="stylesheet" type="text/css" />';
    const sellerStyleCss = '<link href="/assets/css/seller-style.css" rel="stylesheet" type="text/css" />';
    const sellerResponsiveCss = '<link href="/assets/css/seller-responsive.css" rel="stylesheet" type="text/css" />';

    const bootstrapDateTimePickerJs = '<script type="text/javascript" src="/assets/js/bootstrap-datetimepicker.min.js"></script>';
    const momentJs = '<script type="text/javascript" src="/assets/js/moment.min.js"></script>';
    const ratingJS = '<script type="text/javascript" src="/assets/js/rating.js"></script>';
    const fontAwesomeCss = '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" type="text/css" />';
    const dateRangePickerJs = '<script type="text/javascript" src="/assets/js/daterangepicker.js"></script>';

    const jqueryTimepickerCss = '<link href="/assets/css/jquery.timepicker.css" rel="stylesheet" type="text/css" />';
    const jqueryTimepickerJs = '<script type="text/javascript" src="/assets/js/jquery.timepicker.min.js"></script>';

    const oldTagsInputJs = '<script type="text/javascript" src="/assets/bootstrap-tagsinput/bootstrap-tagsinput.js"></script>';
    const newTagsInputJs = '<script type="text/javascript" src="/assets/js/bootstrap-tagsinput-new.js"></script>'

    const jqueryUiJs = '<script type="text/javascript" src="/assets/js/jquery-ui.min.js"></script>';
    const jqueryUiCss = '<link href="/assets/css/jquery-ui.min.css" rel="stylesheet" type="text/css" />';


    if (app.startsWith('merchant-') || app != 'item-detail') {
        console.log('app', app);
        styles.push(sellerStyleCss);

        if (app != 'sub-account-list') {
            styles.push(sellerResponsiveCss);
        }

        styles.push(bootstrapDateTimePickerCss);

        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
    }

    if (app == 'merchant-item-edit') {
        styles.push(canvasCropCss);
        styles.push(bootstrapDateTimePickerCss);

        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
    }

    if (app == 'merchant-order-history') {
        styles.push(featureCss);
    }

    if (bodyClass.endsWith('page-sidebar') || app == 'chat-quotation') {
        styles.push(featureCss);
    }

    if (app == 'purchase-history-detail') {
        js.push(ratingJS);
    }
    if (app == 'merchant-order-detail') {
        styles.push(jqueryTimepickerCss);

        js.push(momentJs);
        js.push(jqueryTimepickerJs);
    }
    if (app == "item-detail") {
        js.push(dateRangePickerJs);
    }
    
    if (app == 'create-receiving-note' || app == 'create-invoice' || app == 'item-detail' || app == 'chat-quotation') {
        styles.push(bootstrapDateTimePickerCss);
        styles.push(jqueryTimepickerCss);

        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
        js.push(jqueryTimepickerJs);
    }
    if (process.env.PRICING_TYPE == 'country_level') {
        js.push(newTagsInputJs);
    } else {
        js.push(oldTagsInputJs);
    }
    if (process.env.PRICING_TYPE == 'service_level') {
        styles.push(bootstrapDateTimePickerCss);
        styles.push(jqueryTimepickerCss);

        js.push(jqueryTimepickerJs);
        js.push(bootstrapDateTimePickerJs);
        js.push(momentJs);

        js.push('<script type="text/javascript" src="/assets/js/fullcalendar-v5/main.js"></script>');
        js.push(jqueryUiJs);
        styles.push('<link href="/assets/js/fullcalendar-v5/main.css" rel="stylesheet" type="text/css"/>');
        styles.push(jqueryUiCss);

        const googleMapJs = '<script src="' + 'https://maps.googleapis.com/maps/api/js?key=' + process.env.GOOGLE_MAP_API_KEY + '&libraries=&v=weekly' + '"></script>'

        if (app == 'item-search') {
            js.push(googleMapJs);
        }

        if (app == 'merchant-item-edit') {
            js.push(googleMapJs);
        }

    }
    return `<!doctype html>
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${title}</title>
                    <link href="/assets/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/slider.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/common.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/switch-btn.css" rel="stylesheet" type="text/css" />                                                                              
                    <link href="/assets/css/groupbuy.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/toastr/toastr.min.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/slick-carousel/slick.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/slick-carousel/slick-theme.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/sol.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/daterangepicker.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/lightbox.min.css" rel="stylesheet" type="text/css" />
                    ${styles.join('')}
                    ${styleCss}
                    ${responsiveCss}
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" type="text/css" />
                    <link href="/assets/css/fa-all.css" rel="stylesheet" type="text/css" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700" rel="stylesheet" />
                    <script type="text/javascript" src="/assets/js/lazysizes.min.js" async ></script>
                    <script type="text/javascript" src="/assets/js/plugins/unveilhooks/ls.unveilhooks.min.js" async ></script>
                </head>
                <body class='${bodyClass}'>
                    <div id="root">${body}</div>
                    <script type="text/javascript" src="/assets/js/jquery.min.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery-migrate.min.js"></script>
                    <script type="text/javascript" src="/assets/js/bootstrap.min.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery.nicescroll.min.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery.ddslick.js"></script>
                    <script type="text/javascript" src="/assets/js/bootstrap-slider.js"></script>
                    <script type="text/javascript" src="/assets/js/item-pagination.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery.canvasCrop.js"></script>
                    <script type="text/javascript" src="/assets/js/sol.js"></script>
                    <script src="https://cdn.ckeditor.com/4.11.4/full/ckeditor.js"></script>
                    <script type="text/javascript" src="/assets/slick-carousel/slick.min.js"></script>
                    <script type="text/javascript" src="/assets/js/lightbox.min.js"></script>
                    <script type="text/javascript" src="/assets/twilio-chat/twilio-chat.min.js"></script>                    
                    <script type="text/javascript" src="/assets/js/daterangepicker.js"></script>
                    <script type="text/javascript" src="/assets/js/codex-fly.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery.shorten.1.0.js"></script>
                    <script type="text/javascript" src="/assets/js/jquery-ui.sortable.min.js"></script>
                    ${js.join('')}
                    <script>window.REDUX_DATA = ${JSON.stringify(reduxState)}</script>
                    <script>window.APP = "${app}"</script>
                    <script type="text/javascript" src="/scripts/bundle.js"></script>
                    <script type="text/javascript" src="/assets/js/page-activity.js"></script>
                    <script src="https://apis.google.com/js/client.js?onload=initAnalytics" async="true"></script>
                    <script>console.log(jQuery.migrateWarnings)</script>
                    <script>
                    function initAnalytics() {
                     }
                    </script>
                </body>
            </html>`;
}
module.exports = template;
