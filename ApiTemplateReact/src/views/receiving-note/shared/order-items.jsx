'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class OrderItemsComponent extends BaseComponent {
    getAlreadyReceivedQuantity(cartItemId) {
        let receivedQuantity = 0;
        if (this.props.isCreateReceivingNote) {
            const { ReceivingNotes } = this.props.orderDetail;
            if (ReceivingNotes && ReceivingNotes.length > 0) {
                ReceivingNotes.forEach((note) => {
                    if (note && note.ReceivingNoteDetails && note.ReceivingNoteDetails.length > 0) {
                        const noteForCartItem = note.ReceivingNoteDetails.find(n => n.CartItemID == cartItemId);
                        receivedQuantity += noteForCartItem ? parseInt(noteForCartItem.Quantity) : 0;
                    }
                });
            }
        } else {
            if (this.props.receivingNoteDetails) {
                const { ReceivingNoteDetails } = this.props.receivingNoteDetails;
                if (ReceivingNoteDetails && ReceivingNoteDetails.length > 0) {
                    const noteForCartItem = ReceivingNoteDetails.find(n => n.CartItemID == cartItemId);
                    receivedQuantity += noteForCartItem ? parseInt(noteForCartItem.ReceivedQuantity) : 0;
                }
            }
        }

        return receivedQuantity;
    }

    getRemainingQuantity(cartItem) {
        let remaining = 0;
        if (this.props.isCreateReceivingNote) {
            remaining = parseInt(cartItem.Quantity) - parseInt(this.getAlreadyReceivedQuantity(cartItem.ID));
        } else {
            if (this.props.receivingNoteDetails) {
                const { ReceivingNoteDetails } = this.props.receivingNoteDetails;
                if (ReceivingNoteDetails && ReceivingNoteDetails.length > 0) {
                    const noteForCartItem = ReceivingNoteDetails.find(n => n.CartItemID == cartItem.ID);
                    remaining += noteForCartItem ? parseInt(noteForCartItem.RemainingQuantity) : 0;
                }
            }
        }
        return remaining;
    }

    getQuantityReceived(cartItemID) {
        let received = 0;
        if (this.props.receivingNoteDetails && this.props.receivingNoteDetails.ReceivingNoteDetails) {
            const { ReceivingNoteDetails } = this.props.receivingNoteDetails;
            if (ReceivingNoteDetails.length > 0) {
                const cartItemInfo = ReceivingNoteDetails.find(c => c.CartItemID == cartItemID);
                if (cartItemInfo && cartItemInfo.Quantity) return cartItemInfo.Quantity;
            }
        }
        return received;
    }


    componentDidMount() {
    }

    renderCartItems() {
        const self = this;
        const { CartItemDetails } = this.props.orderDetail;

        if (CartItemDetails) {
            return (
                CartItemDetails.map((cartItem, index) => {
                    const { ItemDetail } = cartItem;
                    const remainingQuantity = self.getRemainingQuantity(cartItem);

                    return (
                        <tr key={index}>
                            <td data-th="Item Name" width="300px">
                                {ItemDetail.Name}
                                <div className="item-field">
                                    {
                                        ItemDetail.SKU ?
                                            <span className="if-txt">
                                                <span>SKU: </span>
                                                <span>{ItemDetail.SKU}</span>
                                            </span> : ""
                                    }
                                    {self.renderVariants(ItemDetail.Variants)}
                                </div>
                            </td>
                            <td data-th="Quantity Ordered">
                                {cartItem.Quantity}
                            </td>
                            <td data-th="Already Received">
                                {self.getAlreadyReceivedQuantity(cartItem.ID)}
                            </td>
                            <td id="remainingValue" data-th="Remaining">
                                {remainingQuantity}
                            </td>
                            <td data-th="Quantity Received">
                                {self.props.isCreateReceivingNote ?
                                    <input id="itemQuantityReceived" type="number" className="input-field required-input numbersOnlyD" name="item-quantity-received" data-cart-item-id={cartItem.ID} data-remaining-quantity={remainingQuantity} defaultValue={remainingQuantity} />
                                    : self.getQuantityReceived(cartItem.ID)}
                            </td>
                        </tr>
                    )
                })
            );
        }

        return null;
    }

    renderVariants(variants) {
        if (variants && variants.length > 0) {
            return (
                <React.Fragment>
                    {
                        variants.filter(v => v.GroupID != this.props.locationVariantGroupId).map((variant, index) => {
                            return (
                                <span className="if-txt" key={index}>
                                    <span>{variant.GroupName}:</span>
                                    <span>{variant.Name}</span>
                                </span>
                            )
                        })
                    }
                </React.Fragment>
            );
        }

        return null;
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="form-group">
                    <div className="goods-items-history table-responsive">
                        <table className="table tbl-border">
                            <thead>
                                <tr>
                                    <th width="280px">Item Name</th>
                                    <th>Quantity Ordered</th>
                                    <th>Already Received</th>
                                    <th>Remaining</th>
                                    <th>Quantity Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderCartItems()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = OrderItemsComponent;