export default class Coin {
    
    constructor(data) {
        this._initialData = data;

        this.init(this._initialData, false);
    }

    init(data, isReset) {
        this.name = data.name;
        this.symbol = data.symbol;
        this.rank = data.rank;
        this.price = data.price;
        this.priceBtc = data.priceBtc;
        this.isSelected = data.isSelected;
        this.marketCap = data.marketCap;
        this.holdingQuantity = isReset ? 0 : data.holdingQuantity;
        this.isSelected = isReset ? false : data.isSelected;
        this.weight = 0;
        this.currentWeight = 0;
        this.weightMoney = 0;
        this.quantity = 0;
        this.buyQuantity = 0;
        this.sellQuantity = 0;
    }

    reset() {
        this.init(this._initialData, true);
    }
}