'use strict';
var React = require('react');
const PermissionTooltip = require('../common/permission-tooltip');

class ChatQuotationActionComponent extends React.Component {
    redirectCreateQuotation() {
        const self = this;
        if (!this.props.isAuthorizedToAdd) return;

        this.props.validatePermissionToPerformAction('add-merchant-chat-details-api', () => {
            $(".btn-loader").addClass('btn-loading');
            window.location = '/chat/quotation?channelId=' + self.props.channelId;
        });
    }

    redirectQuotationDetail(quotationId) {
        if (!this.props.isAuthorizedToEdit) return;
        const extraPath = this.props.showMerchantActions ? '/merchants' : '';

        this.props.validatePermissionToPerformAction('edit-consumer-chat-details-api', () => window.location = `${extraPath}/quotation/detail?id=` + quotationId);
    }

    renderCreateQuotationAction() {
        const { isAuthorizedToAdd } = this.props;
        return (
            <div className="user-product-buttons">
                <div className="btn-container">
                    {
                        isAuthorizedToAdd ?
                            <button className={'green-btn btn-loader'} id="create-quotation-btn" onClick={(e) => this.redirectCreateQuotation()}>Create Quotation</button>
                            :
                            <button className={'green-btn btn-loader tool-tip icon-grey'} id="create-quotation-btn" onClick={(e) => e.preventDefault()} data-toggle="tooltip" data-placement={"auto top"} title="" data-original-title="You need permission to perform this action">Create Quotation</button>
                    }
                </div>
            </div>
        );
    }

    renderCheckQuotationAction(quotationId) {
        const { isAuthorizedToEdit } = this.props;
        const btnClass = `green-btn openModalRemove ${isAuthorizedToEdit ? '' : 'disabled'}`;
        return (
            <div className="user-product-buttons">
                <div className="btn-container">
                    <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                        <button id="create-quotation-btn" className={btnClass} onClick={(e) => this.redirectQuotationDetail(quotationId)}>Check Quotation</button>
                    </PermissionTooltip>
                </div>
            </div>
        );
    }

    renderAction() {
        var self = this;
        const quotation = self.props.quotation;

        if (quotation) {
            if (!self.props.showMerchantActions) {
                return self.renderCheckQuotationAction(quotation.ID);
            }
        }

        if (self.props.showMerchantActions) {
            if (!quotation || quotation.Declined || quotation.MessageType == 'CANCELLED') {
                return self.renderCreateQuotationAction();
            } else {
                return self.renderCheckQuotationAction(quotation.ID);
            }
        }

        return null;
    }

    render() {
        var self = this;
        return (
            <div>
                {self.renderAction()}
            </div>
        );
    }
}

module.exports = ChatQuotationActionComponent;
