var db = {
    get mode() {
        return localStorage.getItem("mode") == null ? "default" : localStorage.getItem("mode");
    },
    set mode(value) {
        localStorage.setItem("mode", value);
    },
    get maxPercentage() {
        return localStorage.getItem("maxPercentage") == null ? 10 : localStorage.getItem("maxPercentage");
    },
    set maxPercentage(value) {
        localStorage.setItem("maxPercentage", value);
    },
    get investmentAmount() {
        return parseFloat(localStorage.getItem("investmentAmount") == null ? 1500 : localStorage.getItem("investmentAmount"));
    },
    set investmentAmount(value) {
        localStorage.setItem("investmentAmount", value);
    },
    get investmentType() {
        return localStorage.getItem("investmentType") == null ? "USD" : localStorage.getItem("investmentType");
    },
    set investmentType(value) {
        localStorage.setItem("investmentType", value);
    },
    get selectedCoins() {
        return localStorage.getItem("selectedCoins") == null ? null : JSON.parse(localStorage.getItem("selectedCoins"));
    },
    set selectedCoins(value) {
        localStorage.setItem("selectedCoins", JSON.stringify(value));
    },
    get coinMaketCapCache() {
        return localStorage.getItem("coinMaketCapCache") == null ? null : JSON.parse(localStorage.getItem("selectedCoins"));
    },
    set coinMaketCapCache(value) {
        localStorage.setItem("coinMaketCapCache", JSON.stringify(value));
    }
};

export default db;