module.exports = function Cart(OldCart) {
    this.items = OldCart.items || {};
    this.totalQty = OldCart.totalQty || 0;
    this.totalPrice = OldCart.totalPrice || 0;

    this.add = function(item , id) {
        var storedItem = this.items[id];
        if( !storedItem) {
            storedItem = this.items[id] = {item : item, qty : 0, price : 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.SellingPrice * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.SellingPrice;
    };

    this.generateArray = function() {
        var arr = [];
        for( var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
    
    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.reduceItem = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.SellingPrice;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.SellingPrice;
        if( this.items[id].qty <= 0)
        {
            delete this.items[id];
        }
    }
};