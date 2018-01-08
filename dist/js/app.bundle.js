/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Vue = _interopRequireDefault(__webpack_require__(1));

var _jquery = _interopRequireDefault(__webpack_require__(2));

var _db = _interopRequireDefault(__webpack_require__(3));

var _Coin = _interopRequireDefault(__webpack_require__(4));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var scamCoins = ["BCC"];
var vm = new _Vue.default({
  el: "#app",
  data: {
    mode: _db.default.mode,
    maxPercentage: _db.default.maxPercentage,
    investmentAmount: _db.default.investmentAmount,
    investmentType: _db.default.investmentType,
    coins: [],
    numeral: numeral,
    loading: true,
    importMode: "Import",
    importDataText: "",
    exportDataText: "",
    showAll: false
  },
  computed: {
    isRebalancing: function isRebalancing() {
      return this.mode === "rebalancing";
    },
    isBtc: function isBtc() {
      return this.investmentType === "BTC";
    },
    currencySymbol: function currencySymbol() {
      return this.isBtc ? "Ƀ" : "$";
    },
    currencyFormat: function currencyFormat() {
      return this.isBtc ? "0,0.00000000" : "0,0.00";
    },
    selectedCoins: function selectedCoins() {
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
        selectedCoin.currentWeight = selectedCoin.holdingQuantity * priceToUse / this.investmentAmount;
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
    coinsToShow: function coinsToShow() {
      if (this.showAll) {
        return this.coins;
      } else {
        return this.selectedCoins;
      }
    },
    totalPortfolioWorth: function totalPortfolioWorth() {
      var total = 0;

      for (var i = 0; i < this.selectedCoins.length; i++) {
        var coin = this.selectedCoins[i];
        total += (this.isBtc ? coin.priceBtc : coin.price) * coin.holdingQuantity;
      }

      return parseFloat(total).toFixed(this.isBtc ? 8 : 2);
    },
    sellTotalPrices: function sellTotalPrices() {
      var isBtc = this.isBtc;
      return this.selectedCoins.map(function (coin) {
        var price = coin.sellQuantity * (isBtc ? coin.priceBtc : coin.price);
        return isBtc && price < -0.001 || price < -20 ? price : null;
      });
    },
    buyTotalPrices: function buyTotalPrices() {
      var isBtc = this.isBtc;
      return this.selectedCoins.map(function (coin) {
        var price = coin.buyQuantity * (isBtc ? coin.priceBtc : coin.price);
        return isBtc && price > 0.001 || price > 20 ? price : null;
      });
    }
  },
  methods: {
    saveChanges: function saveChanges() {
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

      _db.default.mode = this.mode;
      _db.default.maxPercentage = this.maxPercentage;
      _db.default.investmentAmount = this.investmentAmount;
      _db.default.investmentType = this.investmentType;
      _db.default.selectedCoins = selectedCoins;
    },
    reset: function reset() {
      localStorage.clear();
      window.location.reload();
    },
    launchImporter: function launchImporter() {
      (0, _jquery.default)("#dataImporter").modal();
      console.log(localStorage);
      this.exportDataText = JSON.stringify(JSON.stringify(localStorage, function (key, value) {
        if (key === _db.default.keys.coinMaketCapCache) {
          return undefined;
        }

        return value;
      }));
    },
    importData: function importData() {
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
    processCoinMaketCapData: function processCoinMaketCapData(response) {
      var selectedCoins = _db.default.selectedCoins == null ? [] : _db.default.selectedCoins;

      if (!selectedCoins.length) {
        for (var i = 0; i < response.length; i++) {
          for (var j = 0; j < scamCoins.length; j++) {
            var isScam = scamCoins[j] === response[i].symbol;

            if (!isScam) {
              selectedCoins.push({
                symbol: response[i].symbol
              });
            }
          }

          if (selectedCoins.length >= 20) {
            break;
          }
        }
      }

      var coins = response.map(function (coin) {
        var match = null;

        for (var k = 0; k < selectedCoins.length; k++) {
          if (selectedCoins[k].symbol === coin.symbol) {
            match = selectedCoins[k];
          }
        }

        var isSelected = match != null;
        var holdingQuantity = match == null || !match.holdingQuantity ? 0 : match.holdingQuantity;
        var newCoin = new _Coin.default({
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
  created: function created() {
    var $vm = this;

    if (_db.default.coinMaketCapCache) {
      $vm.processCoinMaketCapData(_db.default.coinMaketCapCache);
    }

    _jquery.default.get({
      url: "https://api.coinmarketcap.com/v1/ticker/?limit=100"
    }).then(function (response) {
      _db.default.coinMaketCapCache = response;
      $vm.processCoinMaketCapData(response);
    }).fail(function (response) {
      alert("Error getting data from coinmarketcap.com");
    });
  }
});
vm.$watch("$data", function () {
  vm.saveChanges();
}, {
  deep: true
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = Vue;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
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
var _default = db;
exports.default = _default;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Coin =
/*#__PURE__*/
function () {
  function Coin(data) {
    _classCallCheck(this, Coin);

    this._initialData = data;
    this.init(this._initialData, false);
  }

  _createClass(Coin, [{
    key: "init",
    value: function init(data, isReset) {
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
  }, {
    key: "reset",
    value: function reset() {
      this.init(this._initialData, true);
    }
  }]);

  return Coin;
}();

exports.default = Coin;

/***/ })
/******/ ]);
//# sourceMappingURL=app.bundle.js.map