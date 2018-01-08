var db = {
    keys: {
        mode: "mode",
        maxPercentage: "maxPercentage",
        investmentAmount: "investmentAmount",
        investmentType: "investmentType",
        selectedCoins: "selectedCoins",
        coinMaketCapCache: "coinMaketCapCache"
    },
    get mode() {
        return localStorage.getItem(this.keys.mode) == null ? "default" : localStorage.getItem(this.keys.mode);
    },
    set mode(value) {
        localStorage.setItem(this.keys.mode, value);
    },
    get maxPercentage() {
        return localStorage.getItem(this.keys.maxPercentage) == null ? 10 : localStorage.getItem(this.keys.maxPercentage);
    },
    set maxPercentage(value) {
        localStorage.setItem(this.keys.maxPercentage, value);
    },
    get investmentAmount() {
        return parseFloat(localStorage.getItem(this.keys.investmentAmount) == null ? 1500 : localStorage.getItem(this.keys.investmentAmount));
    },
    set investmentAmount(value) {
        localStorage.setItem(this.keys.investmentAmount, value);
    },
    get investmentType() {
        return localStorage.getItem(this.keys.investmentType) == null ? "USD" : localStorage.getItem(this.keys.investmentType);
    },
    set investmentType(value) {
        localStorage.setItem(this.keys.investmentType, value);
    },
    get selectedCoins() {
        return localStorage.getItem(this.keys.selectedCoins) == null ? null : JSON.parse(localStorage.getItem(this.keys.selectedCoins));
    },
    set selectedCoins(value) {
        localStorage.setItem(this.keys.selectedCoins, JSON.stringify(value));
    },
    get coinMaketCapCache() {
        return localStorage.getItem(this.keys.coinMaketCapCache) == null ? null : JSON.parse(localStorage.getItem(this.keys.coinMaketCapCache));
    },
    set coinMaketCapCache(value) {
        localStorage.setItem(this.keys.coinMaketCapCache, JSON.stringify(value));
    }
};

export default db;