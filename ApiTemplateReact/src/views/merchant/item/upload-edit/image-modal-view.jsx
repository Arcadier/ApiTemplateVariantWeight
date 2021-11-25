'use strict';
let React = require('react');

class ImageModalViewComponent extends React.Component {
    componentDidMount() {
        this.initializeLegacyScripts();
    }

    initializeLegacyScripts() {
        const { addImage } = this.props;
        const maxUpload = 5;
        let self = this;

        $(function () {
            var rot = 0;
            var ratio = 1;
            var CanvasCrop = $.CanvasCrop({
                cropBox: ".imageBox",
                thumbBox: ".thumbBox",
                fillColor: "#fff",
                imgSrc: " "
            });
            let fileOriginalName = '';

            function countUploadItem() {
                var count = 0;
                var target = $(".uploded-items");
                count = target.children('.uploded-box').length;
                return count;
            }

            $('#upload-file').on("change", function (event) {
                $(".tools").removeClass("hide");
                fileOriginalName = event.target.files[0].name;
                var reader = new FileReader();
                reader.onload = function (e) {
                    CanvasCrop = $.CanvasCrop({
                        cropBox: ".imageBox",
                        imgSrc: e.target.result
                    });
                    rot = 0;
                    ratio = 1;
                };
                reader.readAsDataURL(this.files[0]);
                $("#my-range").val("1.25");
            });

            $("#rotateRight").on("click", function () {
                rot += 90;
                rot = (rot < 0) ? 270 : (rot > 270) ? 0 : rot;
                CanvasCrop.rotate(rot);
            });

            $("#alertInfo").on("click", function () {
                $(".tools").addClass("hide");
                var canvas = document.getElementById("visbleCanvas");
                canvas.remove();
                $(".upload-wapper > .upload-wrapper-container > input").val("");
            });

            $("#crop").on("click", function () {
                var html = '';
                var target = $(".uploded-items");
                var total = countUploadItem();
                const variantId = $(".upload-wapper > .upload-wrapper-container > input").attr('data-variant-id');
                const locationId = $(".upload-wapper > .upload-wrapper-container > input").attr('data-location-id');

                if (((total + 1 <= maxUpload || total == 0) && variantId == "") || variantId != "") {
                    const imageId = Math.floor((Math.random() * 1000) + 100);
                    const url = CanvasCrop.getDataURL("images/jpeg");
                    let imageData = {
                        MediaUrl: url,
                        OriginalName: fileOriginalName
                    };

                    if (variantId) {
                        imageData.VariantId = variantId;
                        imageData.LocationId = locationId;
                    }
                    addImage(self.props.base, imageData);

                    $(".upload-wapper > .upload-wrapper-container > input").attr('data-variant-id', "");
                    $(".upload-wapper > .upload-wrapper-container > input").attr('data-location-id', "");
                } else {
                    html = generateAlert('alert-warning', "Maximum 5 items allow.");
                    target.before(html);
                    fadeOutAlert();
                }

                var canvas = document.getElementById("visbleCanvas");
                canvas.remove();

                $('#myModal').modal('hide');
            });

            $("#fitScreen").on("click", function () {
                CanvasCrop.scale("1");
                $("#my-range").val("1.25");
            });

            $("#my-range").on("change", function () {
                CanvasCrop.scale($(this).val());
            });
        });
    }

    render() {
        return (
            <div className="modal-dialog">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
                <div className="modal-content">
                    <div className="imageBox">
                        <div className="thumbBox" />
                    </div>
                    <div className="upload-wapper">
                        <div className="upload-wrapper-container">
                            <span>Upload Image</span>
                            <input type="file" id="upload-file" defaultValue="Upload" accept="image/*" data-variant-id="" data-location-id="" />
                        </div>
                    </div>
                    <div className="tools clearfix hide">
                        <div className="tools-icons">
                            <div className="btn btn-default" title="rotate-right" id="rotateRight">
                                <i className="fa fa-rotate-right" style={{ fontSize: '12px' }} />
                            </div>
                            <div className="btn btn-default" title="fit-screen" id="fitScreen">
                                <i className="glyphicon glyphicon-fullscreen" style={{ fontSize: '12px' }} />
                            </div>
                            <div className="btn btn-danger btn-cancel" title="Cancel" id="alertInfo">
                                <i className="glyphicon glyphicon-remove" />
                            </div>
                            <div className="btn btn-success btn-ok" title="Crop" id="crop" data-dismiss="modal" aria-label="Close">
                                <i className="glyphicon glyphicon-ok" />
                            </div>

                        </div>
                        <input className="cr-slider " id="my-range" type="range" step="0.0001" aria-label="zoom" min="0.5" max="2" />
                    </div>

                </div>
            </div>
        );
    }
}

module.exports = ImageModalViewComponent;