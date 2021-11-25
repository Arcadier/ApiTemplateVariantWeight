"use strict";
var Moment = require('moment');
var Numeral = require('numeral');
var Currency = require('currency-symbol-map');

var EdmStaticModule = (function () {
    return {
        GetParameters: function () {
            return {
                AdminEmail: '{{AdminEmail}}',
                BulkDeliveryCost: '{{BulkDeliveryCost}}',
                CartQuantity: '{{CartQuantity}}',
                CartSubTotal: '{{CartSubTotal}}',
                ConsumerEmail: '{{ConsumerEmail}}',
                ConsumerContact: '{{ConsumerContact}}',
                ConsumerFirstName: '{{ConsumerFirstName}}',
                ConsumerDisplayName: '{{ConsumerDisplayName}}',
                CurrencyCode: '{{CurrencyCode}}',
                DeliveryAddress: '{{DeliveryAddress}}',
                DeliveryCost: '{{DeliveryCost}}',
                DeliveryCostTotal: '{{DeliveryCostTotal}}',
                DeliveryMethod: '{{DeliveryMethod}}',
                DeliveryName: '{{DeliveryName}}',
                EmailOrUsername: '{{EmailOrUsername}}',
                InvoiceNo: '{{InvoiceNo}}',
                ItemImageUrl: '{{ItemImageUrl}}',
                ItemName: '{{ItemName}}',
                MarketplaceEmail: '{{MarketplaceEmail}}',
                MarketplaceDomain: '{{MarketplaceDomain}}',
                MarketplaceLogoUrl: '{{MarketplaceLogoUrl}}',
                MarketplaceName: '{{MarketplaceName}}',
                MarketplaceUrl: '{{MarketplaceUrl}}',
                OrderDetailUrl: '{{OrderDetailUrl}}',
                OrderItems: '{{OrderItems}}',
                OrderID: '{{OrderID}}',
                OrderTimestamp: '{{OrderTimestamp}}',
                PaidTotal: '{{PaidTotal}}',
                PurchaseDetailUrl: '{{PurchaseDetailUrl}}',
                QuotationID: '{{QuotationID}}',
                ReturnUrl: '{{ReturnUrl}}',
                SellerEmail: '{{SellerEmail}}',
                SubAccountEmail: '{{SubAccountEmail}}',
                Username: '{{Username}}',
                SellerName: '{{SellerName}}',
                SellerDisplayName: '{{SellerDisplayName}}',
                SubTotal: '{{SubTotal}}',
                ToBeCollectedTotal: '{{ToBeCollectedTotal}}',
                Total: '{{Total}}'
            }
        },
        GetTemplates: function (languageCode = 'en') {
            return {
                ForgotPassword: {
                    From: '{{MarketplaceEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Reset Password EDM',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align: center; margin-bottom: 50px;">
                                        <a href="{{MarketplaceUrl}}">
                                            <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                        </a>
                                    </div>
                                    <div style="">
                                        <p>We\'ve received a request to reset the password for {{EmailOrUsername}}.</p>
                                        <p>
                                            Please reset your password by clicking here<br/>
                                            <a href="{{ReturnUrl}}" style="word-wrap: break-word;">{{ReturnUrl}}</a>
                                        </p>
                                        <p>If you did not request to change your password, please contact your marketplace administrator immediately.</p>
                                    </div>
                                </div>
                            </div>`
                },
                InviteMerchantSubAccount: {
                    From: '{{SellerEmail}}',
                    To: '{{SubAccountEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Invite Merchant Sub-Account',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img style="max-width:200px;" src="{{MarketplaceLogoUrl}}">
                                    </div>
                                    <div style="margin-bottom:35px;">
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{SubAccountEmail}},</p>
                                        <p>You have been given access to \'{{MarketplaceName}}\' storefront!</p>
                                        <p>Kindly follow the link below to get your login access.</p>
                                    </div>
                                    <div align="center">
                                        <a style="background-color:#FF5A60; color:#fff; display:inline-block; padding: 15px 60px; text-decoration: none; border-radius: 50px; margin-top: 7px;" href="{{ReturnUrl}}">Create Account</a>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        <p style="margin-top:0px;">Best,<br>{{MarketplaceName}}</p>
                                    </div>
                                </div>
                            </div>`
                },
                InviteBuyerSubAccount: {
                    From: '{{ConsumerEmail}}',
                    To: '{{SubAccountEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Sub-Account Invite',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img style="max-width:200px;" src="{{MarketplaceLogoUrl}}">
                                    </div>
                                    <div style="margin-bottom:35px;">
                                        <p>Hi <span style="color:#000; font-weight:bold; margin-bottom:50px;">{{SubAccountEmail}}</span>,</p>
                                        <p>You have been given access to {{ConsumerDisplayName}} main account.</p>
                                        <p>Kindly follow the link below to get your login access.</p>
                                    </div>
                                    <div align="center">
                                        <a style="background-color:#FF5A60; color:#fff; display:inline-block; padding: 15px 60px; text-decoration: none; border-radius: 50px; margin-top: 7px;" href="{{ReturnUrl}}">Create Account</a>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        <p style="margin-top:0px;">
                                            Best,<br>
                                            {{MarketplaceName}}<br>
                                            <a href="{{MarketplaceUrl}}" target="_blank" style="color: #FF5A60; font-weight: 700; text-decoration: none;">{{MarketplaceDomain}}</a>
                                        </p>
                                    </div>
                                </div>
                            </div>`
                },
                OrderConfirmation: {
                    From: '{{AdminEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Order Confirmation',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width:200px;" />
                                    </div>
                                    <div>
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{ConsumerFirstName}},</p>
                                        <p>We\'ve received your order!</p>
                                        <p>Thank you for placing your order with us. Your order will be ready shortly! We\'ll notify you once your order is on its way, or when it\'s ready for your collection!</p>
                                        <p>If you have any questions, please contact us at <a style="color:#FF5A60; font-weight:bold; text-decoration:none;" href="mailto:{{MarketplaceEmail}}">{{MarketplaceEmail}}</a>. If you wish to change your order please contact your seller directly and let us know.</p>
                                    </div>
                                    <div style="border-bottom:1px solid #000; border-top:1px solid #000; padding-top: 10px; padding-bottom: 10px; margin-top:50px;">
                                        <table border="0" style="width:100%; color:#B3B3B3;">
                                            <tr>
                                                <td style="font-weight:bold;">INVOICE ID <span style="color:#000;">{{InvoiceNo}}</span></td>
                                                <td style="text-align:right;">{{OrderTimestamp}}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="margin-top:30px;">
                                        {{OrderItems}}
                                    </div>
                                    <div style="margin-top:30px;">
                                        <table style="width:100%;">
                                            <tr style="vertical-align:top;">
                                                <td style="line-height: 25px;">
                                                    <div style="color:#000; font-weight:bold;">Delivery Address :</div> {{DeliveryAddress}}
                                                </td>
                                                <td style="line-height:35px; text-align:right; min-width:170px;">
                                                    <div>
                                                        <span style="padding-right:10%;">Sub Total</span>{{SubTotal}}
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Delivery Costs</span>{{DeliveryCostTotal}}
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Bulk Costs</span>- {{BulkDeliveryCost}}
                                                    </div>
                                                    <div style="border-top:1px solid #ddd; padding-top:15px; margin-top:15px;">
                                                        <span style="padding-right:10%; font-size:22px; font-weight:bold;">TOTAL</span>
                                                        <span style="font-size:22px; color:#000; font-weight:bold;">{{Total}}</span>
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Paid</span>
                                                        <span style="min-width:100px;display: inline-block;text-align: right;">{{PaidTotal}}</span>
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">To be collected</span>
                                                        <span style="min-width:100px;display: inline-block;text-align: right;">{{ToBeCollectedTotal}}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="text-align:center; margin-top:100px; margin-bottom:100px">
                                        <a href="{{PurchaseDetailUrl}}" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding:11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">VIEW ORDERS</a>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        <p style="font-size:18px; font-weight:bold; color:#000;">We hope to see you again soon!</p>
                                        <p>Regards,<br />{{MarketplaceName}}</p>
                                    </div>
                                </div>
                            </div>`
                },
                OrderAcknowledged: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Order Acknowledged',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width:200px;" />
                                    </div>
                                    <div>
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{ConsumerFirstName}},</p>
                                        <p>The seller has acknowledged your order.</p>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        If you have any questions about your order, feel free to contact your seller or drop us an email at <a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="mailto:{{MarketplaceEmail}}">{{MarketplaceEmail}}</a>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        <p>Regards,<br />{{MarketplaceName}}</p>
                                    </div>
                                </div>
                            </div>`
                },
                OrderShipped: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Your order is on its way!',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                    </div>
                                    <div>
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{ConsumerFirstName}},</p>
                                        <p>Your order has been shipped!</p>
                                    </div>
                                    <div style="border-bottom:1px solid #000; border-top:1px solid #000; padding-top: 10px; padding-bottom: 10px; margin-top:50px;">
                                        <table border="0" style="width:100%; color:#B3B3B3;">
                                            <tbody>
                                                <tr>
                                                    <td style="font-weight:bold;">INVOICE ID <span style="color:#000;">{{InvoiceNo}}</span></td>
                                                    <td style="text-align:right;">{{OrderTimestamp}}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style="margin-top:30px;">
                                        <table style="width:100%;">
                                            <tbody>
                                                <tr>
                                                    <td style="vertical-align: top; width:20%; max-width:120px; min-width:33px;"><img style="width:100%; max-width:120px;" src="{{ItemImageUrl}}"></td>
                                                    <td style="vertical-align: top; padding-left:5px;">
                                                        <div style="line-height: 25px;">
                                                            <p style="margin-top:0px; color:#000; line-height:22px;">{{ItemName}}</p>
                                                            <p>Qty: {{CartQuantity}}</p>
                                                        </div>
                                                    </td>
                                                    <td style="width:25%; max-width: 150px; text-align: right; vertical-align: top; padding-top: 20px; font-size: 22px; color: #000; font-weight: bold;">{{CartSubTotal}}</td>
                                                </tr>
                                                <tr>
                                                    <td>&nbsp;</td>
                                                    <td>
                                                        <div style="color:#000;font-weight:bold;">{{DeliveryMethod}}</div>
                                                        <div>{{DeliveryName}} + {{DeliveryCost}}</div>
                                                    </td>
                                                    <td style="width:25%; max-width: 150px; text-align: right; vertical-align: bottom; color:#000; font-weight: bold;">{{SellerDisplayName}}<br><a style="color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;" href="mailto:{{SellerEmail}}">{{SellerEmail}}</a></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style="border-bottom:1px solid #d2d2d2; margin-top:10px; margin-bottom:20px;">&nbsp;</div>
                                    </div>
                                    <div style="margin-top:30px;">
                                        <table style="width:100%;">
                                            <tbody>
                                                <tr style="vertical-align:top;">
                                                    <td style="line-height: 25px;">
                                                        <div style="color:#000; font-weight:bold;">Delivery Address:</div>{{DeliveryAddress}}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style="text-align: center; margin-top: 100px; margin-bottom: 80px">
                                        <a href="{{PurchaseDetailUrl}}" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding: 11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">VIEW ORDERS</a>
                                    </div>
                                    <div style="margin-bottom:50px;">This will be at your doorstep shortly! If you have any questions about your order feel free to contact your seller or drop us an email at <a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="mailto:{{MarketplaceEmail}}">{{MarketplaceEmail}}</a></div><div style="margin-bottom:50px;">
                                        <p>Regards,<br>{{MarketplaceName}}</p>
                                    </div>
                                </div>
                            </div>`
                },
                OrderPickup: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Your order is ready!',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                    </div>
                                    <div>
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{ConsumerFirstName}},</p>
                                        <p>Your order is ready for pick up!</p>
                                    </div>
                                    <div style="border-bottom:1px solid #000; border-top:1px solid #000; padding-top: 10px; padding-bottom: 10px; margin-top:50px;">
                                        <table border="0" style="width:100%; color:#B3B3B3;">
                                            <tbody>
                                                <tr>
                                                    <td style="font-weight:bold;">INVOICE ID <span style="color:#000;">{{InvoiceNo}}</span></td>
                                                    <td style="text-align:right;">{{OrderTimestamp}}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style="margin-top:30px;">
                                        <table style="width:100%;">
                                            <tbody>
                                                <tr>
                                                    <td style="vertical-align: top; width:20%; max-width:120px; min-width:33px;"><img style="width:100%; max-width:120px;" src="{{ItemImageUrl}}"></td>
                                                    <td style="vertical-align: top; padding-left:5px;">
                                                        <div style="line-height: 25px;">
                                                            <p style="margin-top:0px; color:#000; line-height:22px;">{{ItemName}}</p>
                                                            <p>Qty: {{CartQuantity}}</p>
                                                        </div>
                                                    </td>
                                                    <td style="width:25%; max-width: 150px; text-align: right; vertical-align: top; padding-top: 20px; font-size: 22px; color: #000; font-weight: bold;">{{CartSubTotal}}</td> 
                                                </tr>
                                                <tr>
                                                    <td>&nbsp;</td>
                                                    <td>
                                                        <div style="color:#000;font-weight:bold;">{{DeliveryMethod}}</div>
                                                        <div>{{DeliveryName}}</div>
                                                    </td>
                                                    <td style="width:25%; max-width: 150px; text-align: right; vertical-align: bottom; color:#000; font-weight: bold;">{{SellerDisplayName}}<br><a style="color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;" href="mailto:{{SellerEmail}}">{{SellerEmail}}</a></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style="border-bottom:1px solid #d2d2d2; margin-top:10px; margin-bottom:20px;">&nbsp;</div>
                                    </div>
                                    <div style="text-align: center; margin-top: 100px; margin-bottom: 80px">
                                        <a href="{{PurchaseDetailUrl}}" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding: 11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">VIEW ORDERS</a>
                                    </div>
                                    <div style="margin-bottom:50px;">Please pick up your item from the address above! If you have any questions about your order feel free to contact your seller or drop us an email at <a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="mailto:{{MarketplaceEmail}}">{{MarketplaceEmail}}</a></div> 
                                    <div style="margin-bottom:50px;">
                                        <p>Regards,<br>{{MarketplaceName}}</p>
                                    </div>
                                </div>
                            </div>`
                },
                ChatEnquiry: {
                    From: '{{ConsumerEmail}}',
                    To: '{{SellerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Enquiry from Buyer',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                            <div style="padding:15px;">
                                <div style="text-align:center; margin-bottom:50px;">
                                    <img src="{{MarketplaceLogoUrl}}">
                                </div>
                                <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{SellerName}},</p>
                                <p>You have a new enquiry from <span style="color:#000; font-weight:bold;">{{ConsumerFirstName}}</span>.</p>
                                <p><a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none;">Click here to view the enquiry.</a> </p>
                                <p>&nbsp;</p>
                                <p style="color:#000; font-weight:bold;">Thank you!</p>
                                <p>&nbsp;</p>
                                <p>Regards,<br />{{MarketplaceName}}</p>
                            </div>
                           </div>`

                },
                ChatMessageFromBuyer: {
                    From: '{{ConsumerEmail}}',
                    To: '{{SellerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'New message from consumer',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                            <div style="padding:15px;">
                                <div style="text-align:center; margin-bottom:50px;">
                                    <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                </div>
                                <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi, {{SellerName}},</p>
                                <p>You have a new message from <span style="color:#000; font-weight:bold;">{{ConsumerFirstName}}.</span></p>
                                <p><a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none;">Click here to respond.</a> </p>
                                <p>&nbsp;</p>
                                <p style="color:#000; font-weight:bold;">Thank you!</p>
                                <p>&nbsp;</p>
                                <p>
                                    Regards,<br>
                                    {{MarketplaceName}}
                                </p>
                            </div>
                        </div>`
                },
                ChatMessageFromSeller: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'New message from merchant',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                            <div style="padding:15px;">
                                <div style="text-align:center; margin-bottom:50px;">
                                    <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                </div>
                                <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi, {{ConsumerFirstName}},</p>
                                <p>You have a new message from <span style="color:#000; font-weight:bold;">{{SellerName}}</span>.</p>
                                <p><a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none;">Click here to respond.</a> </p>
                                <p>&nbsp;</p>
                                <p style="color:#000; font-weight:bold;">Thank you!</p>
                                <p>&nbsp;</p>
                                <p>
                                    Regards,<br />
                                    {{MarketplaceName}}
                                </p>
                            </div>
                        </div>`
                },
                ChatSendOffer: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'You have a new offer',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                            <div style="padding:15px;">
                                <div style="text-align:center; margin-bottom:50px;">
                                    <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                </div>
                                <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{ConsumerFirstName}},</p>
                                <p>You have a new offer from <span style="color:#000; font-weight:bold;">{{SellerName}}</span>.</p>
                                <p>Click <a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none;">here</a> to view and respond to {{SellerName}}'s offer.</p>
                                <p>&nbsp;</p>
                                <p style="color:#000; font-weight:bold;">Thank you!</p>
                                <p>&nbsp;</p>
                                <p>
                                    Regards,<br>
                                    {{MarketplaceName}}
                                </p>
                                <p><a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="{{MarketplaceUrl}}">{{MarketplaceUrl}}</a></p>
                            </div>
                        </div>`
                },
                ChatDeclineOffer: {
                    From: '{{ConsumerEmail}}',
                    To: '{{SellerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Offer declined',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                            <div style="padding:15px;">
                                <div style="text-align:center; margin-bottom:50px;">
                                    <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                </div>
                                <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi, {{SellerName}},</p>
                                <p>The offer that you sent to <span style="color:#000; font-weight:bold;"> {{ConsumerFirstName}} </span> has been declined.</p>
                                <p><a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none;">Click here to continue negotiating.</a> </p>
                                <p>&nbsp;</p>
                                <p style="color:#000; font-weight:bold;">Thank you!</p>
                                <p>&nbsp;</p>
                                <p>
                                    Regards,<br>
                                    {{MarketplaceName}}
                                </p>
                            </div>
                        </div>`
                },
                WelcomeMailBuyer: {
                    From: '{{AdminEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Welcome To {{MarketplaceName}}',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">      
                            <div style="padding:15px;">
                             <div style="text-align:center; margin-bottom:50px;">
                              <img src="{{MarketplaceLogoUrl}}" style="max-width:200px;" />
                             </div>
                           <div style="">
                              <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi,</p>
                              <p>Welcome to marketplace! </p>
                              <p>We hope that you enjoy shopping at marketplace as much as we enjoy bringing you new content! </p>
                              <p>Your login ID is <a style="color:#FF5A60; font-weight:bold; text-decoration:none;" href="mailto:{{ConsumerEmail}}">{{Username}}</a>.</p>
                           </div>
                           <div style="text-align:center; margin-top:100px; margin-bottom:100px">
                              <a href="{{MarketplaceUrl}}" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding:11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">START SHOPPING</a>
                           </div>
                          <div style="margin-bottom:50px;">
                              <p>Regards,<br />{{MarketplaceName}}</p>
                              <p><a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="{{MarketplaceUrl}}">{{MarketplaceUrl}}</a></p>
                         </div>
                      </div>
                    </div>`
                },
                StartSellingSeller: {
                    From: '{{AdminEmail}}',
                    To: '{{SellerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Welcome To {{MarketplaceName}}',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">      
                            <div style="padding:15px;">
                             <div style="text-align:center; margin-bottom:50px;">
                              <img src="{{MarketplaceLogoUrl}}" style="max-width:200px;" />
                             </div>
                           <div style="">
                              <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{SellerName}},</p>
                              <p>We are excited to have you onboard!</p>
                              <p>We look forward to you filling up your store with lots and lots of items! </p>                              
                           </div>
                           <div style="text-align:center; margin-top:100px; margin-bottom:100px">
                            <a href="{{MarketplaceUrl}}/merchants/upload" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding:11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">START SELLING</a> </div>
                          <div style="margin-bottom:50px;">
                              <p>Regards,<br />{{MarketplaceName}}</p>
                              <p><a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="{{MarketplaceUrl}}">{{MarketplaceUrl}}</a></p>
                         </div>
                      </div>
                    </div>`
                },
                NewOrderSeller: {
                    From: '{{AdminEmail}}',
                    To: '{{SellerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'You have a new order!',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width:200px;" />
                                    </div>
                                    <div>
                                        <p style="color:#000; font-weight:bold; margin-bottom:50px;">Hi {{SellerName}},</p>
                                        <p>You have a new order from <a href="javascript:void(0);" style="color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;">{{ConsumerFirstName}}</a>.</p>
                                        <p style="font-size:22px; color:#000; font-weight:bold;">ORDER ID : {{OrderID}}</p>
                                    </div>
                                    <div style="border-bottom:1px solid #000; border-top:1px solid #000; padding-top: 10px; padding-bottom: 10px; margin-top:50px;">
                                        <table border="0" style="width:100%; color:#B3B3B3;">
                                            <tr>
                                                <td style="font-weight:bold;">INVOICE ID <span style="color:#000;">{{InvoiceNo}}</span></td>
                                                <td style="text-align:right;">{{OrderTimestamp}}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="margin-top:30px;">
                                        {{OrderItems}}
                                    </div>
                                    <div style="margin-top:30px;">
                                        <table style="width:100%;">
                                            <tr style="vertical-align:top;">
                                                <td style="line-height: 25px;">
                                                    <div style="color:#000; font-weight:bold;">Delivery Address :</div> {{DeliveryAddress}}
                                                </td>
                                                <td style="line-height:35px; text-align:right; min-width:170px;">
                                                    <div>
                                                        <span style="padding-right:10%;">Sub Total</span>{{SubTotal}}
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Delivery Costs</span>{{DeliveryCostTotal}}
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Bulk Costs</span>- {{BulkDeliveryCost}}
                                                    </div>
                                                    <div style="border-top:1px solid #ddd; padding-top:15px; margin-top:15px;">
                                                        <span style="padding-right:10%; font-size:22px; font-weight:bold;">TOTAL</span>
                                                        <span style="font-size:22px; color:#000; font-weight:bold;">{{Total}}</span>
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">Paid</span>
                                                        <span style="min-width:100px;display: inline-block;text-align: right;">{{PaidTotal}}</span>
                                                    </div>
                                                    <div>
                                                        <span style="padding-right:10%;">To be collected</span>
                                                        <span style="min-width:100px;display: inline-block;text-align: right;">{{ToBeCollectedTotal}}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="text-align:center; margin-top:100px; margin-bottom:100px">
                                        <a href="{{PurchaseDetailUrl}}" style="font-size: 18px; background-color: #FF5A60; text-decoration: none; color: #fff; padding:11.5px 30px; border-radius: 50px; width: 180px; display: inline-block;">VIEW ORDER DETAILS</a>
                                    </div>
                                    <div style="margin-bottom:30px;">If you have any concerns about fulfilling the order or foresee any delays, please contact your buyer as soon as possible:</div>
                                    <div style="margin-bottom:50px;">
                                             <p>Buyer Name: <span style="color:#000; font-weight:bold;">{{ConsumerFirstName}}</span></p>
                                             <p>Buyer Contact Number: <span style="color:#000; font-weight:bold;">{{ConsumerContact}}</span></p>
                                             <p>Buyer Email Address: <span style="color:#000; font-weight:bold;">{{ConsumerEmail}}</span></p>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                             <p>Regards,<br />
                                             {{MarketplaceName}}</p>
                                             <p><a style="color:#FF5A60; font-size:17px; font-weight:bold; text-decoration:none;" href="{{MarketplaceUrl}}">{{MarketplaceUrl}}</a></p>
                                    </div>
                                </div>
                            </div>`
                },
                QuotationCancelled: {
                    From: '{{SellerEmail}}',
                    To: '{{ConsumerEmail}}',
                    BCC: null,
                    CC: null,
                    Subject: 'Quotation {{QuotationID}} has been cancelled',
                    Body: `<div style="max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;">
                                <div style="padding:15px;">
                                    <div style="text-align:center; margin-bottom:50px;">
                                        <img src="{{MarketplaceLogoUrl}}" style="max-width: 200px;">
                                    </div>
                                    <div style="margin-bottom:35px;">
                                        <p style="color:#000; font-weight:bold; margin-bottom:40px;">Hi {{ConsumerFirstName}},</p>
                                        <p>The quotation <span style="font-weight: 700; color:#000000">{{QuotationID}}</span> has been cancelled.</p>
                                        <p>To contact the supplier and view the chat, <a href="{{ReturnUrl}}" style="color:#FF5A60; text-decoration: none; outline: none; font-weight: 600;">click here</a>.</p>
                                    </div>
                                    <div style="margin-bottom:50px;">
                                        <p style="margin-top:0px;">Best,<br>{{MarketplaceName}} <br><a href="{{MarketplaceUrl}}" target="_blank" style="color: #FF5A60; font-weight: 700; text-decoration: none;">{{MarketplaceDomain}}</a></p>
                                    </div>
                                </div>
                            </div>`
                },
            }
        },
        GetOrderStatuses: function () {
            return [
                'Acknowledged',
                'Delivered',
                'Ready For Consumer Collection'
            ];
        },
        MapMarketplaceToParameters: function (marketplace, protocol = '', hostname = '') {
            let parameters = [];

            parameters.push({
                key: this.GetParameters().MarketplaceName,
                value: marketplace.Name
            });

            parameters.push({
                key: this.GetParameters().MarketplaceLogoUrl,
                value: marketplace.LogoUrl
            });

            parameters.push({
                key: this.GetParameters().MarketplaceEmail,
                value: marketplace.BusinessProfile ? marketplace.BusinessProfile.ContactPersonEmail : ''
            });

            parameters.push({
                key: this.GetParameters().AdminEmail,
                value: marketplace.Owner.Email
            });

            parameters.push({
                key: this.GetParameters().MarketplaceUrl,
                value: protocol + '://' + hostname
            });

            parameters.push({
                key: this.GetParameters().MarketplaceDomain,
                value: hostname
            });

            return parameters;
        },
        MapInvoiceToParameters: function (invoice, protocol = '', hostname = '') {
            let parameters = [];
            let order = null;
            let cartItem = null;
            if (process.env.CHECKOUT_FLOW_TYPE === 'b2b')
            {
                order = invoice;
                cartItem = invoice.CartItemDetails[0];    
            } else {
                order = invoice.Orders[0]
                cartItem = invoice.Orders[0].CartItemDetails[0];
            }
            let consumerName = order.ConsumerDetail.FirstName;
            if (order.ConsumerDetail.LastName) {
                consumerName = order.ConsumerDetail.FirstName + " " + order.ConsumerDetail.LastName;
            }

            let sellerName = order.MerchantDetail.FirstName;
            if (order.MerchantDetail.LastName) {
                sellerName = order.MerchantDetail.FirstName + " " + order.MerchantDetail.LastName;
            }

            parameters.push({
                key: this.GetParameters().ConsumerFirstName,
                value: consumerName
            });

            parameters.push({
                key: this.GetParameters().ConsumerEmail,
                value: order.ConsumerDetail.Email
            });

            parameters.push({
                key: this.GetParameters().ConsumerContact,
                value: order.ConsumerDetail.PhoneNumber
            });
            
            parameters.push({
                key: this.GetParameters().SellerEmail,
                value: order.MerchantDetail.Email
            });

            parameters.push({
                key: this.GetParameters().SellerDisplayName,
                value: order.MerchantDetail.DisplayName
            });

            parameters.push({
                key: this.GetParameters().SellerName,
                value: sellerName
            });

            parameters.push({
                key: this.GetParameters().InvoiceNo,
                value: invoice.InvoiceNo
            });

            parameters.push({
                key: this.GetParameters().OrderTimestamp,
                value: formatDateTime(order.CreatedDateTime)
            });

            parameters.push({
                key: this.GetParameters().ItemName,
                value: cartItem.ItemDetail.Name
            });

            parameters.push({
                key: this.GetParameters().CartQuantity,
                value: cartItem.Quantity
            });

            parameters.push({
                key: this.GetParameters().ItemImageUrl,
                value: cartItem.ItemDetail.Media[0].MediaUrl
            });

            parameters.push({
                key: this.GetParameters().CartSubTotal,
                value: formatMoney(order.CurrencyCode, order.Total)
            });

            let deliveryMethod = cartItem.CartItemType;
            if (deliveryMethod) {
                deliveryMethod = deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1);
            }

            parameters.push({
                key: this.GetParameters().DeliveryMethod,
                value: deliveryMethod
            });

            parameters.push({
                key: this.GetParameters().DeliveryName,
                value: getDeliveryMethodName(order)
            });

            parameters.push({
                key: this.GetParameters().DeliveryCost,
                value: formatMoney(order.CurrencyCode, order.Freight)
            });

            parameters.push({
                key: this.GetParameters().DeliveryAddress,
                value: getDeliveryAddress(order)
            });

            parameters.push({
                key: this.GetParameters().PurchaseDetailUrl,
                value: protocol + '://' + hostname + '/purchase/detail/' + invoice.InvoiceNo
            });

            parameters.push({
                key: this.GetParameters().OrderDetailUrl,
                value: protocol + '://' + hostname + '/purchase/detail/' + invoice.InvoiceNo
            });

            parameters.push({
                key: this.GetParameters().MarketplaceUrl,
                value: protocol + '://' + hostname
            });
            let orders = null;
            if (invoice.Orders)
            {
                 orders = invoice.Orders;
            } else {
                 //b2b
                 orders = invoice;
            }
            parameters.push({
                key: this.GetParameters().OrderItems,
                value: getOrderItemsHtml(orders)
            });

            parameters.push({
                key: this.GetParameters().OrderID,
                value: order.ID
            });

            parameters.push({
                key: this.GetParameters().SubTotal,
                value: getInvoiceSubTotal(invoice)
            });

            parameters.push({
                key: this.GetParameters().DeliveryCostTotal,
                value: getInvoiceDeliveryCost(invoice)
            });

            parameters.push({
                key: this.GetParameters().BulkDeliveryCost,
                value: getInvoiceBulkDiscount(invoice)
            });

            parameters.push({
                key: this.GetParameters().Total,
                value: getInvoiceTotal(invoice)
            });

            parameters.push({
                key: this.GetParameters().PaidTotal,
                value: getInvoicePaidTotal(invoice)
            });

            parameters.push({
                key: this.GetParameters().ToBeCollectedTotal,
                value: getInvoiceToBeColletedTotal(invoice)
            });

            return parameters;
        },
        MapParametersToTemplate: function (template, parameters) {
            var templateKeys = Object.keys(template);

            templateKeys.forEach(function (key) {
                parameters.forEach(function(parameter) {
                    if (template[key] != null && template[key].indexOf(parameter.key) > -1) {
                        template[key] = template[key].replace(new RegExp(parameter.key, 'g'), parameter.value);
                    }
                });
            });

            return template;
        },
        GetChatEmailTypes: function () {
            return {
                Enquiry: 'Enquiry',
                MessageFromBuyer: 'MessageFromBuyer',
                MessageFromSeller: 'MessageFromSeller',
                NewOffer: 'NewOffer',
                OfferDelined: 'OfferDelined'
            }
        },
        MapChatToEdmParameters: function (chatOptions, protocol = '', hostname = '') {
            let parameters = [];
           
            parameters.push({
                key: this.GetParameters().ConsumerFirstName,
                value: chatOptions.ConsumerFirstName ? chatOptions.ConsumerFirstName : ''
            });

            parameters.push({
                key: this.GetParameters().SellerName,
                value: chatOptions.SellerName ? chatOptions.SellerName : ''
            });

            parameters.push({
                key: this.GetParameters().SellerDisplayName,
                value: chatOptions.SellerDisplayName ? chatOptions.SellerDisplayName : ''
            });

            parameters.push({
                key: this.GetParameters().ReturnUrl,
                value: protocol + '://' + hostname + '/chat?channelId=' + chatOptions.ChannelId
            });

            parameters.push({
                key: this.GetParameters().ConsumerEmail,
                value: chatOptions.ConsumerEmail ? chatOptions.ConsumerEmail : ''
            });

            parameters.push({
                key: this.GetParameters().SellerEmail,
                value: chatOptions.SellerEmail ? chatOptions.SellerEmail : ''
            });

            parameters.push({
                key: this.GetParameters().MarketplaceUrl,
                value: protocol + '://' + hostname
            });

            return parameters;
        },
        GetQuotationEmailTypes: function () {
            return {
                QuotationCancelled: 'QuotationCancelled',
                QuotationDeclined: 'QuotationDeclined',
                QuotationAccepted: 'QuotationAccepted'
            }
        },
        MapQuotationToParameters: function (options, protocol = '', hostname = '') {
            let parameters = [];

            parameters.push({
                key: this.GetParameters().ConsumerFirstName,
                value: options.ConsumerFirstName ? options.ConsumerFirstName : ''
            });

            parameters.push({
                key: this.GetParameters().SellerName,
                value: options.SellerName ? options.SellerName : ''
            });

            parameters.push({
                key: this.GetParameters().SellerDisplayName,
                value: options.SellerDisplayName ? options.SellerDisplayName : ''
            });

            parameters.push({
                key: this.GetParameters().ReturnUrl,
                value: protocol + '://' + hostname + '/chat?channelId=' + options.ChannelId
            });

            parameters.push({
                key: this.GetParameters().ConsumerEmail,
                value: options.ConsumerEmail ? options.ConsumerEmail : ''
            });

            parameters.push({
                key: this.GetParameters().SellerEmail,
                value: options.SellerEmail ? options.SellerEmail : ''
            });

            parameters.push({
                key: this.GetParameters().QuotationID,
                value: options.QuotationId ? options.QuotationId : ''
            });

            return parameters;
        }
    };
})();

function formatDateTime(timestamp, format) {
    if (typeof format === 'undefined') {
        format = process.env.DATETIME_FORMAT;
    }

    if (typeof timestamp === 'number') {
        //Unix datetime
        return Moment.unix(timestamp).utc().local().format(format);
    } else {
        //Json datetime
        return Moment.utc(timestamp).local().format(format);
    }
}

function formatMoney(currencyCode, amount) {
    let format = process.env.MONEY_FORMAT;
    if (typeof currencyCode === 'undefined') currencyCode = process.env.DEFAULT_CURRENCY;
    if (typeof amount === 'undefined' || isNaN(amount)) {
        return '';
    }

    return currencyCode + ' ' + Currency(currencyCode) + ' ' + Numeral(amount).format(format);
}

function getDeliveryMethodName(order) {
    let deliveryMethodName = null;

    if (order) {
        if (order.CartItemDetails) {
            const cartItem = order.CartItemDetails[0];

            if (cartItem.CartItemType && cartItem.CartItemType.toLowerCase() === 'delivery') {
                const shipping = cartItem.ShippingMethod;

                if (shipping) {
                    deliveryMethodName = shipping.Description;
                }
            } else if (cartItem.CartItemType && cartItem.CartItemType.toLowerCase() === 'pickup') {
                const pickup = cartItem.PickupAddress;

                if (pickup) {
                    deliveryMethodName = pickup.Line1;
                }
            }
        }

        if (!deliveryMethodName) {
            if (order.CustomFields) {
                const deliveryCustomField = order.CustomFields.find(c => c.Name == 'OrderDeliveryOption');
                if (deliveryCustomField) {
                    const deliveryOption = JSON.parse(deliveryCustomField.Values[0]);
                    deliveryMethodName = deliveryOption.Name;
                }
            }
        }
    }

    return deliveryMethodName;
}

function getDeliveryAddress(order) {
    let deliveryAddress = [];

    if (order) {
        const deliveryToAddress = order.DeliveryToAddress;

        if (deliveryToAddress) {
            let addresseeName = deliveryToAddress.Name;

            if (addresseeName && addresseeName.split('|').length > 1) {
                addresseeName = addresseeName.replace('|', ' ');
            }

            deliveryAddress.push(addresseeName);
            deliveryAddress.push(deliveryToAddress.Line1);
            deliveryAddress.push(deliveryToAddress.Line2);
            deliveryAddress.push(deliveryToAddress.State);
            deliveryAddress.push(deliveryToAddress.City);
            deliveryAddress.push(deliveryToAddress.Country);
            deliveryAddress.push(deliveryToAddress.PostCode);
        }
    }

    return deliveryAddress.filter(function (value) {
        return value != null;
    }).join('<br />');
}

function getInvoiceSubTotal(invoice) {
    let subTotal = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        if (invoice.Orders)
        {
              invoice.Orders.forEach(function (order) {
              subTotal += order.Total;
              }); 
        } else {
         //b2b
           subTotal += invoice.Total; 
        }      
    }

    return formatMoney(currencyCode, subTotal);
}

function getInvoiceDeliveryCost(invoice) {
    let deliveryCost = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        if (invoice.Orders)
        {
             invoice.Orders.forEach(function (order) {
             deliveryCost += (order.Freight || 0);
             });
        } else {
             deliveryCost += (invoice.Freight || 0);
        }
    }

    return formatMoney(currencyCode, deliveryCost);
}

function getInvoiceBulkDiscount(invoice) {
    let discount = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        if (invoice.Orders)
        {
        invoice.Orders.forEach(function (order) {
            if (order.CartItemDetails) {
                order.CartItemDetails.forEach(function (cartItem) {
                    discount += (cartItem.DiscountAmount || 0);
                });
            }
        });

        } else {
             if (invoice.CartItemDetails) {
                invoice.CartItemDetails.forEach(function (cartItem) {
                    discount += (cartItem.DiscountAmount || 0);
                });
            }   
        }
    }

    return formatMoney(currencyCode, discount);
}

function getInvoiceTotal(invoice) {
    let total = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        total = invoice.Total;
    }

    return formatMoney(currencyCode, total);
}

function getInvoicePaidTotal(invoice) {
    let total = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        //TODO: update this for bespoke api, cod payments
        total = invoice.Total;
    }

    return formatMoney(currencyCode, total);
}

function getInvoiceToBeColletedTotal(invoice) {
    let total = 0;
    let currencyCode = null;

    if (invoice) {
        currencyCode = invoice.CurrencyCode;
        if (invoice.Orders)
        {
        invoice.Orders.forEach(function (order) {
            if (order.CartItemDetails) {
                order.CartItemDetails.forEach(function (cartItem) {
                    //TODO: update this for bespoke api, cod payments
                    total += 0;
                });
            }
        });
        } else {
            if (invoice.CartItemDetails) {
                invoice.CartItemDetails.forEach(function (cartItem) {
                    //TODO: update this for bespoke api, cod payments
                    total += 0;
                });
            }
        }
    }

    return formatMoney(currencyCode, total);
}

function getOrderItemsHtml(orders) {
    let html = [];

    if (orders) {
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b')
        {

              if (orders.CartItemDetails) {
                const merchant = orders.MerchantDetail;

                orders.CartItemDetails.forEach(function (cartItem) {
                    const item = cartItem.ItemDetail;

                    if (item) {
                        const itemMedia = item.Media;

                        html.push(`<table style="width:100%;">`);
                        html.push(`<tbody>`);
                        html.push(`<tr>`);
                        html.push(`<td style="vertical-align:top; width:20%; max-width:120px; min-width:33px;"><img style="width:100%; max-width:120px;" src="${itemMedia && itemMedia.length > 0 ? itemMedia[0].MediaUrl : ''}"></td>`);
                        html.push(`<td style="vertical-align:top; padding-left:5px;">`);
                        html.push(`<div style="line-height:25px;">`);
                        html.push(`<p style="margin-top:0px; color:#000; line-height:22px;">${item.Name}</p>`);
                        html.push(`<p>Qty: ${cartItem.Quantity}</p>`);
                        //TODO: need update for bespoke api
                        //html.push('<p>{variant.VariantGroupName}: {variant.VariantName}</p>');
                        html.push(`</div>`);
                        html.push(`</td>`);
                        html.push(`<td style="width:25%; max-width:150px; text-align:right; vertical-align:top; padding-top:20px; font-size:22px; color:#000; font-weight:bold;">${formatMoney(cartItem.CurrencyCode, cartItem.SubTotal)}</td>`);
                        html.push(`</tr>`);
                        html.push(`<tr>`);
                        html.push(`<td>&nbsp;</td>`);
                        html.push(`<td>`);
                        html.push(`<div style="color:#000; font-weight:bold;">${cartItem.CartItemType ? cartItem.CartItemType.charAt(0).toUpperCase() + cartItem.CartItemType.slice(1) : ''}</div>`);
                        html.push(`<div>${getDeliveryMethodName(orders)}`);
                        if (cartItem.CartItemType && cartItem.CartItemType.toLowerCase() === 'delivery') {
                            html.push(` + ${formatMoney(cartItem.CurrencyCode, orders.Freight)}`);
                        }
                        html.push(`</div>`);
                        html.push(`</td>`);
                        html.push(`<td style="width:25%; max-width:150px; text-align:right; vertical-align:bottom; color:#000; font-weight:bold;">`);
                        html.push(`${merchant ? merchant.DisplayName : ''}<br>`);
                        html.push(`<a style="color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;" href="mailto:${merchant ? merchant.Email : ''}">${merchant ? merchant.Email : ''}</a>`);
                        html.push(`</td>`);
                        html.push(`</tr>`);
                        html.push(`</tbody>`);
                        html.push(`</table>`);
                        html.push(`<div style="border-bottom:1px solid #d2d2d2; margin-top:10px; margin-bottom:20px;">&nbsp;</div>`);
                    }
                });
            }

        } else {
        orders.forEach(function (order) {
            if (order.CartItemDetails) {
                const merchant = order.MerchantDetail;

                order.CartItemDetails.forEach(function (cartItem) {
                    const item = cartItem.ItemDetail;

                    if (item) {
                        const itemMedia = item.Media;

                        html.push(`<table style="width:100%;">`);
                        html.push(`<tbody>`);
                        html.push(`<tr>`);
                        html.push(`<td style="vertical-align:top; width:20%; max-width:120px; min-width:33px;"><img style="width:100%; max-width:120px;" src="${itemMedia && itemMedia.length > 0 ? itemMedia[0].MediaUrl : ''}"></td>`);
                        html.push(`<td style="vertical-align:top; padding-left:5px;">`);
                        html.push(`<div style="line-height:25px;">`);
                        html.push(`<p style="margin-top:0px; color:#000; line-height:22px;">${item.Name}</p>`);
                        html.push(`<p>Qty: ${cartItem.Quantity}</p>`);
                        //TODO: need update for bespoke api
                        //html.push('<p>{variant.VariantGroupName}: {variant.VariantName}</p>');
                        html.push(`</div>`);
                        html.push(`</td>`);
                        html.push(`<td style="width:25%; max-width:150px; text-align:right; vertical-align:top; padding-top:20px; font-size:22px; color:#000; font-weight:bold;">${formatMoney(cartItem.CurrencyCode, cartItem.SubTotal)}</td>`);
                        html.push(`</tr>`);
                        html.push(`<tr>`);
                        html.push(`<td>&nbsp;</td>`);
                        html.push(`<td>`);
                        html.push(`<div style="color:#000; font-weight:bold;">${cartItem.CartItemType ? cartItem.CartItemType.charAt(0).toUpperCase() + cartItem.CartItemType.slice(1) : ''}</div>`);
                        html.push(`<div>${getDeliveryMethodName(order)}`);
                        if (cartItem.CartItemType && cartItem.CartItemType.toLowerCase() === 'delivery') {
                            html.push(` + ${formatMoney(cartItem.CurrencyCode, order.Freight)}`);
                        }
                        html.push(`</div>`);
                        html.push(`</td>`);
                        html.push(`<td style="width:25%; max-width:150px; text-align:right; vertical-align:bottom; color:#000; font-weight:bold;">`);
                        html.push(`${merchant ? merchant.DisplayName : ''}<br>`);
                        html.push(`<a style="color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;" href="mailto:${merchant ? merchant.Email : ''}">${merchant ? merchant.Email : ''}</a>`);
                        html.push(`</td>`);
                        html.push(`</tr>`);
                        html.push(`</tbody>`);
                        html.push(`</table>`);
                        html.push(`<div style="border-bottom:1px solid #d2d2d2; margin-top:10px; margin-bottom:20px;">&nbsp;</div>`);
                    }
                });
            }
        });
        }

    }

    return html.join('');
}

module.exports = EdmStaticModule;