'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function uploadCustomFieldFile(formData) {
    return $.ajax({
        url: '/users/profile/pdf',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST'
    });
}

function uploadCustomFieldImage(formData) {
    return $.ajax({
        url: '/users/profile/multiple-custom-field-media',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST'
    });
}

function proceedUpdateUserInfo(userInfo, dispatch) {
    if (userInfo.MediaOriginalFileName != null && userInfo.MediaOriginalFileName.length > 0) {
        console.log('updating userinfo media');
        const formData = new FormData();
        var block = userInfo.MediaUrl.split(';');
        var contentType = block[0].split(':')[1];
        var realData = block[1].split(',')[1];
        const convertedBuffer = b64toBlob(realData, contentType);
        formData.append('userMedia', convertedBuffer, userInfo.MediaOriginalFileName);
        $.ajax({
            url: '/users/profile/media',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST'
        }).then(function (data, textStatus, jqXHR) {
            userInfo.MediaOriginalFileName = null;
            userInfo.MediaUrl = null;
            userInfo.Media = [];
            userInfo.Media.push({ ID: data[0].ID });
            delete userInfo.MediaUrl;
            delete userInfo.MediaOriginalFileName;

            return userInfo;
        }).then(function (userInfo) {
            ajaxUpdateUserInfo(dispatch, userInfo);
        });
    } else {
        delete userInfo.MediaUrl;
        delete userInfo.MediaOriginalFileName;
        ajaxUpdateUserInfo(dispatch, userInfo);
    }
}

function proceedUpdateImageCustomField(userInfo, dispatch, callback) {
    //Process image files from custom fields
    var imageCustomFields = userInfo.CustomFields.filter(r => r.DataInputType === "image");
    if (imageCustomFields && imageCustomFields.length > 0) {
        const formData = new FormData();

        imageCustomFields.forEach(image => {
            const block = image.File.split(';');
            const contentType = block[0].split(':')[1];
            const realData = block[1].split(',')[1];
            const convertedBuffer = b64toBlob(realData, contentType);
            formData.append(image.Code, convertedBuffer, image.Filename);
        });

        Promise.all([uploadCustomFieldImage(formData)]).then((responses) => {
            const response = responses[0];

            response.forEach((media, index) => {
                const customFieldCode = imageCustomFields[index].Code;
                const mediaUrl = media.MediaUrl;
                if (customFieldCode && mediaUrl) {
                    const customField = userInfo.CustomFields.find(r => r.Code === customFieldCode);
                    if (customField) {
                        customField.Values = [];
                        customField.Values.push(mediaUrl);
                        delete customField.File;
                        delete customField.Filename;
                    }
                }
                console.log('image ', mediaUrl);
            });            
            proceedUpdateUserInfo(userInfo, dispatch);
        }).catch(err => {
            if (callback) {
                callback('Failed to upload image');
                return false;
            }
        });
    }
    else {
        proceedUpdateUserInfo(userInfo, dispatch);
    }
}

function updateUserInfo(userInfo, callback) {
    return function (dispatch) {
        if (userInfo.CustomFields) {
            var userCustomFilePromises = [];
            //Process pdf files from custom fields
            var pdfCustomFields = userInfo.CustomFields.filter(r => r.DataInputType === "upload");
            if (pdfCustomFields && pdfCustomFields.length > 0) {
                pdfCustomFields.forEach(pdf => {
                    const formData = new FormData();
                    var block = pdf.File.split(';');
                    var contentType = block[0].split(':')[1];
                    var realData = block[1].split(',')[1];
                    const convertedBuffer = b64toBlob(realData, contentType);
                    formData.append('userPdf', convertedBuffer);
                    formData.append('customFieldCode', pdf.Code);
                    formData.append('filename', pdf.Filename);
                    userCustomFilePromises.push(uploadCustomFieldFile(formData));
                });
                Promise.all(userCustomFilePromises).then((responses) => {
                    responses.forEach(resp => {
                        if (resp) {
                            var customFieldCode = resp.customFieldCode;
                            var uploadResult = '';
                            if (resp.result && resp.result.length > 0) {
                                uploadResult = resp.result[0].SourceUrl;
                            }
                            if (customFieldCode) {
                                var customField = userInfo.CustomFields.find(r => r.Code === customFieldCode);
                                if (customField) {
                                    customField.Values = [];
                                    customField.Values.push(uploadResult);
                                    delete customField.File;
                                }
                            }
                            console.log('pdf ', uploadResult);
                        }
                    });
                    console.log('updating image');
                    proceedUpdateImageCustomField(userInfo, dispatch, callback);
                }).catch(err => {
                    if (callback) {
                        console.log('failed to save pdf');
                        callback('Failed to upload pdf.');
                        return false;
                    }
                });;                
            }
            else {
                console.log('no pdf, updating image');
                proceedUpdateImageCustomField(userInfo, dispatch, callback);
            }
        }
        else {     
            console.log('none both, updating user info');
            proceedUpdateUserInfo(userInfo, dispatch);
        }
    };
}

function getLocations(callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/user/locations',
            type: 'GET',
            success: function (result) {
                if (typeof callback == 'function') {
                    callback(result);
                }

                // empty dispatch only
                return dispatch({
                    type: '',
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createCustomFieldDefinition(customFieldDefinition) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/user/customFieldDefinition',
            type: 'POST',
            data: customFieldDefinition,
            success: function (result) {
                return dispatch({
                    type: actionTypes.CREATE_USER_CUSTOM_FIELD,
                    CustomFields: result
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function ajaxUpdateUserInfo(dispatch, userInfo) {
    console.log('updating userinfo');
    const userAjaxOptions = {
        url: '/users/update',
        type: 'PUT',
        data: JSON.stringify(userInfo),
        contentType: 'application/json'
    };
    $.ajax(userAjaxOptions)
        .done(function (user) {
            console.log('done update user info');
            return dispatch({
                type: actionTypes.UPDATE_USER_INFO,
                user: user
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

module.exports = {
    updateUserInfo: updateUserInfo,
    getLocations: getLocations,
    createCustomFieldDefinition: createCustomFieldDefinition
};
