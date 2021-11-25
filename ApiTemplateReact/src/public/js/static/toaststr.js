"use strict";

var ToastStrStaticModule = (function () {
    return {
        Get: function () {
            return {
                Error: {
                    REQUIRED_LOGIN_CREDENTIALS: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Username and password is required.'
                    },
                    INVALID_LOGIN_CREDENTIALS: {
                        type: 'error',
                        header: 'Oops!',
                        body: 'Sorry! Your login details are incorrect. Please try again or contact the administrator. '
                    },
                    INVALID_TOKEN: {
                        type: 'error',
                        header: 'Oops!',
                        body: 'Your token has been used or invalid. Please contact the site\'s administrator.'
                    },
                    INVALID_LOGIN_SUB_ACCOUNT_DISABLED: {
                        type: 'error',
                        header: 'Oops!',
                        body: 'Sub account login is disabled by admin.'
                    },
                    REQUIRED_EMAIL_OR_USERNAME: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Email/Username is required.'
                    },
                    PLEASE_SELECT_A_DELIVERY_ADDRESS_TO_PROCEED: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Please select a delivery address before continuing.'
                    },
                    PLEASE_SELECT_A_RECORD_TO_PROCEED: {
                        type: 'error',
                        header: '',
                        body: 'Please select a record to proceed.'
                    },
                    PASSWORD_ERRORS: {
                        PASSWORD_MUST_CONTAIN_SIX_CHARACTERS: {
                            type: 'error',
                            header: 'Oops!',
                            body: 'Password must contain at least 6 characters'
                        },
                        PASSWORD_CONFIRM_DOESNT_MATCH: {
                            type: 'error',
                            header: 'Oops!',
                            body: 'Your passwords do not match. '
                        },
                        OLD_PASSWORD_DOESNT_MATCH: {
                            type: 'error',
                            header: 'Oops! Something went wrong.',
                            body: 'Old password is incorrect. '
                        },
                    },
                    USER_NAME_PASSWORD_REQUIRED: {
                        type: 'error',
                        header: 'Oops!',
                        body: 'Username and password is required.'
                    },
                    PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED: {
                        type: 'error',
                        header: '',
                        body: 'Please fill out the required field to proceed.'
                    },
                    ITEM_VISIBILITY_DISABLED_BY_ADMIN: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Item visibility has been disabled by marketplace administrator.'
                    },
                    ITEM_VISIBILITY_DISABLED_BY_ADMIN_OR_MERCHANT: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Item visibility has been disabled (by marketplace Administrator or Merchant).'
                    },
                    FAILED_ITEM_VISIBILITY_UPDATE: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Item visibility has been disabled by marketplace administrator.'
                    },
                    INVALID_SUB_ACCOUNT_EMAILS: {
                        type: 'error',
                        header: 'Error',
                        body: 'One of the emails are invalid.'
                    },
                    INVALID_EMAILS: {
                        type: 'error',
                        header: 'Error',
                        body: 'Invalid email format.'
                    },
                    INVALID_PROFILE_PICTURE: {
                        type: 'error',
                        header: 'Error',
                        body: 'Profile picture is required.'
                    },
                    FAILED_SUB_ACCOUNT_DELETE: {
                        type: 'error',
                        header: 'Error',
                        body: 'There was an error trying to delete sub-account.'
                    },
                    FAILED_SUB_ACCOUNT_INVITE: {
                        type: 'error',
                        header: 'Error',
                        body: 'There was an error trying to send email invite.'
                    },
                    NO_ORDER_SELECTED_TO_UPDATE: {
                        type: 'error',
                        header: 'Error',
                        body: 'Please select an order first.'
                    },
                    INVALID_SUB_MERCHANT_REGISTRATION: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'We cannot get your login details from the provider, please try logging in again.'
                    },
                    CHECKOUT_ITEM_HAS_BEEN_UPDATED: {
                        type: 'error',
                        header: '',
                        body: 'Checkout failed! Item details have been updated, please remove and compare the item again.'
                    },
                    UNREGISTERED_LOGIN_ACCOUNT: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'You are not allowed to access the marketplace. Please contact the administrator.'
                    },
                    FAILED_ADD_DISABLED_ITEM_TO_COMPARISON: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'You cannot add a deleted/unavailable item to comparison table.'
                    },
                    CHECKOUT_PAYMENT_DO_NOT_SUPPORT_MULTIPLE_ORDERS: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Selected payment method does not support multi-merchant checkout, please select items from only one seller and checkout again'
                    },
                    REQUIRED_DELIVERY_RATE_DETAILS: {
                        type: 'error',
                        header: 'Error',
                        body: 'Please add delivery rates.'
                    },
                    CANCEL_QUOTATION_FAILED: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Unable to cancel quotation. Please try again or contact the administrator.'
                    },
                    DECLINE_QUOTATION_FAILED: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Unable to decline quotation. Please try again or contact the administrator.'
                    },
                    CREATE_INVOICE_FAILED: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Unable to create invoice by cart items. Please try again or contact the administrator.'
                    },
                    CREATE_ORDER_FAILED: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Unable to create order by cart items. Please try again or contact the administrator.'
                    },
                    INVALID_SERVICE_BOOKING: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'Failed to book the selected session, please try again.'
                    },
                    INSUFFICIENT_STOCK: {
                        type: 'error',
                        header: 'Oops! Something went wrong.',
                        body: 'The time period that you have selected has been completely booked out, please try choosing another.'
                    }
                },
                Success: {
                    DATA_SUCCESSFULLY_SAVED: {
                        type: 'success',
                        header: '',
                        body: ''
                    },
                    SUCCESS_SUB_ACCOUNT_INVITE: {
                        type: 'success',
                        header: 'Success!',
                        body: 'Invites had been successfully sent.'
                    },
                    UPDATED_ITEM_PURCHASABILITY: {
                        type: 'success',
                        header: 'Success!',
                        body: 'Item\'s availability was successfully updated.'
                    }
                }
            }
        }
    };

})();

module.exports = ToastStrStaticModule;