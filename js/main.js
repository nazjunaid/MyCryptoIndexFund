(function(Vue, $, localStorage, numeral) {

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
        }
    };

    function Coin(data) {
        var initialData = data;

        this.init = function(data, isReset) {
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
        };

        this.reset = function() {
            this.init(initialData, true);
        };

        this.init(initialData, false);
    }

    var scamCoins = ["BCC"];

    var vm = new Vue({
        el: "#app",
        data: {
            mode: db.mode,
            maxPercentage: db.maxPercentage,
            investmentAmount: db.investmentAmount,
            investmentType: db.investmentType,
            coins: [],
            numeral: numeral,
            importMode: "Import",
            importDataText: "",
            exportDataText: "",
            loading: true
        },
        methods: {
            saveChanges: function(event) {

                var selectedCoins = [];

                for (var i = 0; i < this.selectedCoins.length; i++) {
                    var coin = this.selectedCoins[i];

                    if (coin.isSelected) {
                        selectedCoins.push({
                            symbol: coin.symbol,
                            holdingQuantity: coin.holdingQuantity
                        });
                    }
                }

                db.mode = this.mode;
                db.maxPercentage = this.maxPercentage;
                db.investmentAmount = this.investmentAmount;
                db.investmentType = this.investmentType;
                db.selectedCoins = selectedCoins;
            },
            reset: function() {
                localStorage.clear();
                window.location.reload();
            },
            launchImporter: function() {
                $("#dataImporter").modal();

                this.exportDataText = JSON.stringify(JSON.stringify(localStorage));
            },
            importData: function() {
                try {
                    var data = JSON.parse(JSON.parse(this.importDataText));

                    localStorage.clear();

                    Object.keys(data).forEach(function(k) {
                        localStorage.setItem(k, data[k]);
                    });

                    window.location.reload();
                } catch (e) {
                    alert("Import failed, please make sure you copy/pasted the full text");
                    throw e;
                }
            }
        },
        computed: {
            isRebalancing: function() {
                return this.mode === "rebalancing";
            },
            isBtc: function() {
                return this.investmentType === "BTC";
            },
            currencySymbol: function() {
                return this.isBtc ? "Ƀ" : "$";
            },
            selectedCoins: function() {
                var totalCap = 0;

                var selectedCoins = [];
                for (var j = 0; j < this.coins.length; j++) {
                    var coin = this.coins[j];

                    if (coin.isSelected === true) {
                        totalCap += coin.marketCap;
                        selectedCoins.push(coin);
                    } else {
                        coin.reset();
                    }
                }

                var totalCapRemaining = totalCap;
                var percentageRemaining = 1;
                var maxPercentageFraction = parseFloat(this.maxPercentage / 100);

                for (var i = 0; i < selectedCoins.length; i++) {
                    var selectedCoin = selectedCoins[i];

                    selectedCoin.weight = Math.min(maxPercentageFraction, percentageRemaining * selectedCoin.marketCap / totalCapRemaining);
                    selectedCoin.weightMoney = selectedCoin.weight * this.investmentAmount;
                    var priceToUse = this.isBtc ? selectedCoin.priceBtc : selectedCoin.price;

                    selectedCoin.quantity = selectedCoin.weightMoney / priceToUse;
                    selectedCoin.currentWeight = (selectedCoin.holdingQuantity * priceToUse) / this.investmentAmount;

                    var quantityDifference = selectedCoin.quantity - selectedCoin.holdingQuantity;

                    if (quantityDifference < 0) {
                        selectedCoin.sellQuantity = quantityDifference;
                        selectedCoin.buyQuantity = 0;
                    } else {
                        selectedCoin.buyQuantity = quantityDifference;
                        selectedCoin.sellQuantity = 0;
                    }

                    percentageRemaining -= selectedCoin.weight;
                    totalCapRemaining -= selectedCoin.marketCap;
                }

                return selectedCoins;
            },
            coinsToShow: function() {
                if (this.isRebalancing) {
                    return this.selectedCoins;
                } else {
                    return this.coins;
                }
            },
            totalPortfolioWorth: function() {
                var total = 0;
                for (var i = 0; i < this.selectedCoins.length; i++) {
                    var coin = this.selectedCoins[i];

                    total += (this.isBtc ? coin.priceBtc : coin.price) * coin.holdingQuantity;
                }

                return parseFloat(total).toFixed(this.isBtc ? 8 : 2);
            },
            sellTotalPrices: function() {
                var isBtc = this.isBtc;

                return this.selectedCoins.map(function(coin) {
                    var price = coin.sellQuantity * (isBtc ? coin.priceBtc : coin.price);
                    return (isBtc && price < -0.001) || price < -20 ? price : null;
                });
            },
            buyTotalPrices: function() {
                var isBtc = this.isBtc;

                return this.selectedCoins.map(function(coin) {
                    var price = coin.buyQuantity * (isBtc ? coin.priceBtc : coin.price);

                    return (isBtc && price > 0.001) || price > 20 ? price : null;
                });
            }
        },
        created: function() {
            $.get({
                url: "https://api.coinmarketcap.com/v1/ticker/?limit=100"
            }).then(function (response) {

                var selectedCoins = db.selectedCoins == null ? [] : db.selectedCoins;
                if (!selectedCoins.length) {
                    for (var i = 0; i < response.length; i++) {
                        for (var j = 0; j < scamCoins.length; j++) {
                            var isScam = scamCoins[j] === response[i].symbol;
                            if (!isScam) {
                                selectedCoins.push({ symbol: response[i].symbol });
                            }
                        }
                        if (selectedCoins.length >= 20) {
                            break;
                        }
                    }
                }

                var coins = response.map(function(coin) {

                    var match = null;
                    for (var k = 0; k < selectedCoins.length; k++) {
                        if (selectedCoins[k].symbol === coin.symbol) {
                            match = selectedCoins[k];
                        }
                    }

                    var isSelected = match != null;
                    var holdingQuantity = match == null || !match.holdingQuantity ? 0 : match.holdingQuantity;

                    var newCoin = new Coin({
                        name: coin.name,
                        symbol: coin.symbol,
                        rank: coin.rank,
                        price: parseFloat(coin.price_usd),
                        priceBtc: parseFloat(coin.price_btc),
                        marketCap: parseFloat(coin.market_cap_usd),
                        isSelected: isSelected,
                        holdingQuantity: holdingQuantity
                    });

                    return newCoin;
                });

                vm.loading = false;
                vm.coins = coins;
            }).fail(function() {
                alert("Error getting data from coinmarketcap.com");
                console.log(response.body);
            });
        }
    });

    vm.$watch("$data", function() {
        vm.saveChanges();
    }, { deep: true });

})(window.Vue, window.jQuery, window.localStorage, window.numeral);