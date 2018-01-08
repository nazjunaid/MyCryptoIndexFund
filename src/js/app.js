import Vue from "Vue";
import $ from "jquery";
import db from "./db.js";
import Coin from "./Coin.js";

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
        loading: true,
        importMode: "Import",
        importDataText: "",
        exportDataText: "",
        showAll: false
    },
    computed: {
        isRebalancing: function () {
            return this.mode === "rebalancing";
        },
        isBtc: function () {
            return this.investmentType === "BTC";
        },
        currencySymbol: function () {
            return this.isBtc ? "Ƀ" : "$";
        },
        currencyFormat: function () {
            return this.isBtc ? "0,0.00000000" : "0,0.00";
        },
        selectedCoins: function () {
            var totalCap = 0;

            const selectedCoins = [];
            for (let j = 0; j < this.coins.length; j++) {
                const coin = this.coins[j];

                if (coin.isSelected === true) {
                    totalCap += coin.marketCap;
                    selectedCoins.push(coin);
                } else {
                    coin.reset();
                }
            }

            var totalCapRemaining = totalCap;
            var percentageRemaining = 1;
            const maxPercentageFraction = parseFloat(this.maxPercentage / 100);

            for (let i = 0; i < selectedCoins.length; i++) {
                const selectedCoin = selectedCoins[i];

                selectedCoin.weight = Math.min(maxPercentageFraction,
                    percentageRemaining * selectedCoin.marketCap / totalCapRemaining);
                selectedCoin.weightMoney = selectedCoin.weight * this.investmentAmount;
                const priceToUse = this.isBtc ? selectedCoin.priceBtc : selectedCoin.price;

                selectedCoin.quantity = selectedCoin.weightMoney / priceToUse;
                selectedCoin.currentWeight = (selectedCoin.holdingQuantity * priceToUse) / this.investmentAmount;

                const quantityDifference = selectedCoin.quantity - selectedCoin.holdingQuantity;

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
        coinsToShow: function () {
            if (this.showAll) {
                return this.coins;
            } else {
                return this.selectedCoins;
            }
        },
        totalPortfolioWorth: function () {
            var total = 0;
            for (let i = 0; i < this.selectedCoins.length; i++) {
                const coin = this.selectedCoins[i];

                total += (this.isBtc ? coin.priceBtc : coin.price) * coin.holdingQuantity;
            }

            return parseFloat(total).toFixed(this.isBtc ? 8 : 2);
        },
        sellTotalPrices: function () {
            var isBtc = this.isBtc;

            return this.selectedCoins.map(function (coin) {
                const price = coin.sellQuantity * (isBtc ? coin.priceBtc : coin.price);
                return (isBtc && price < -0.001) || price < -20 ? price : null;
            });
        },
        buyTotalPrices: function () {
            var isBtc = this.isBtc;

            return this.selectedCoins.map(function (coin) {
                const price = coin.buyQuantity * (isBtc ? coin.priceBtc : coin.price);

                return (isBtc && price > 0.001) || price > 20 ? price : null;
            });
        }
    },
    methods: {
        saveChanges: function() {

            const selectedCoins = [];

            for (let i = 0; i < this.selectedCoins.length; i++) {
                const coin = this.selectedCoins[i];

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
        launchImporter: function () {
            $("#dataImporter").modal();

            console.log(localStorage);

            this.exportDataText = JSON.stringify(JSON.stringify(localStorage, function(key, value) {
                if (key === db.keys.coinMaketCapCache) {
                    return undefined;
                }
                return value;
            }));
        },
        importData: function () {
            try {
                var data = JSON.parse(JSON.parse(this.importDataText));

                localStorage.clear();

                Object.keys(data).forEach(function (k) {
                    localStorage.setItem(k, data[k]);
                });

                window.location.reload();
            } catch (e) {
                alert("Import failed, please make sure you copy/pasted the full text");
                throw e;
            }
        }, 
        processCoinMaketCapData: function (response) {

            var selectedCoins = db.selectedCoins == null ? [] : db.selectedCoins;
            if (!selectedCoins.length) {
                for (let i = 0; i < response.length; i++) {
                    for (let j = 0; j < scamCoins.length; j++) {
                        const isScam = scamCoins[j] === response[i].symbol;
                        if (!isScam) {
                            selectedCoins.push({ symbol: response[i].symbol });
                        }
                    }
                    if (selectedCoins.length >= 20) {
                        break;
                    }
                }
            }

            const coins = response.map(function (coin) {

                var match = null;
                for (let k = 0; k < selectedCoins.length; k++) {
                    if (selectedCoins[k].symbol === coin.symbol) {
                        match = selectedCoins[k];
                    }
                }

                const isSelected = match != null;
                const holdingQuantity = match == null || !match.holdingQuantity ? 0 : match.holdingQuantity;

                const newCoin = new Coin({
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

            this.loading = false;
            this.coins = coins;
        }
    },
    created: function () {
        var $vm = this;

        if (db.coinMaketCapCache) {
            $vm.processCoinMaketCapData(db.coinMaketCapCache);
        }

        $.get({
            url: "https://api.coinmarketcap.com/v1/ticker/?limit=100"
        }).then(function(response) {
            
            db.coinMaketCapCache = response;
            $vm.processCoinMaketCapData(response);

        }).fail(function(response) {
            alert("Error getting data from coinmarketcap.com");
        });
    }
});

vm.$watch("$data", function() {
    vm.saveChanges();
}, { deep: true });