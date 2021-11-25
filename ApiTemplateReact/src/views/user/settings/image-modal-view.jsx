'use strict';
const React = require('react');

class ImageModalView extends React.Component {
    componentDidMount() {
        const { uploadProfileImage } = this.props;
        var self = this;

        var rot = 0; var ratio = 1;
        var CanvasCrop = $.CanvasCrop({
            cropBox: '.imageBox',
            thumbBox: '.thumbBox',
            imgSrc: ' ',
            limitOver: 2
        });
        let fileOriginalName = '';

        $('#upload-file').on('change', function(event) {
            $('.tools').removeClass('hide');
            fileOriginalName = event.target.files[0].name;
            var reader = new FileReader();
            reader.onload = function(e) {
                CanvasCrop = $.CanvasCrop({
                    cropBox: '.imageBox',
                    imgSrc: e.target.result,
                    limitOver: 2
                });
                rot = 0;
                ratio = 1;
            };
            reader.readAsDataURL(this.files[0]);
        });

        $('#rotateLeft').on('click', function() {
            rot -= 90;
            rot = rot < 0 ? 270 : rot;
            CanvasCrop.rotate(rot);
        });

        $('#rotateRight').on('click', function() {
            rot += 90;
            rot = rot > 360 ? 90 : rot;
            CanvasCrop.rotate(rot);
        });

        $('#crop').on('click', function() {
            const data = CanvasCrop.getDataURL('images/jpeg');
            uploadProfileImage({ Base64Data: data, OriginalName: fileOriginalName });

            var canvas = document.getElementById('visbleCanvas');
            canvas.remove();

            $('#modalImage').modal('hide');
        });

        $('#alertInfo').on('click', function() {
            $('.tools').addClass('hide');
            var canvas = document.getElementById('visbleCanvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            $('#upload-file').val('');
        });

        $('#my-range').on('change', function() {
            CanvasCrop.scale($(this).val());
        });
    }

    render() {
        return (
            <div id='myModal' className='modal-image-cropsec modal fade' role='dialog'>
                <div className='modal-dialog'>
                    <button type='button' className='close' data-dismiss='modal' aria-label='Close'> <span aria-hidden='true'>&times;</span> </button>
                    <div className='modal-content'>
                        <div className='imageBox'>
                            <div className='thumbBox'></div>
                        </div>
                        <div className='upload-wapper'> Upload Item
                            <input type='file' id='upload-file' accept='image/*' />
                        </div>
                        <div className='tools clearfix hide'>
                            <div className='btn btn-default' title='rotate-left' id='rotateLeft'> <i className='fa fa-rotate-left' style={{ fontSize: '12px' }}></i> </div>
                            <div className='btn btn-default' title='rotate-right' id='rotateRight'> <i className='fa fa-rotate-right' style={{ fontSize: '12px' }}></i> </div>
                            <div className='btn btn-danger btn-cancel' title='Cancel' id='alertInfo'> <i className='glyphicon glyphicon-remove'></i> </div>
                            <div className='btn btn-success btn-ok' title='Crop' id='crop' data-dismiss='modal' aria-label='Close'> <i className='glyphicon glyphicon-ok'></i> </div>
                            <input className='cr-slider ' id='my-range' type='range' step='0.001' aria-label='zoom' min='0.5' max='3.5000' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
module.exports = ImageModalView;
