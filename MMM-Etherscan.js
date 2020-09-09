/* global Module */


/* Magic Mirror
 * Module: MMM-Etherscan
 *
 * By Marc Helpenstein
 * MIT Licensed.
 */

Module.register("MMM-Etherscan", {
    defaults: {
        updateInterval: 60000,
        retryDelay: 5000,
        addresses: [
            {
                "name": "",
                "address": "",
            },
        ],
        apiKey: "",
        showLastBlock: true,
    },

    requiresVersion: "2.1.0", // Required version of MagicMirror

    start: function () {
        var self = this;
        var dataRequest = null;
        var dataNotification = null;
        let blockData = null;
        //Flag for check if module is loaded
        this.loaded = false;

        // Schedule update timer.
        this.sendSocketNotification("GETBLOCK", this.config);
        this.getData();
        setInterval(function () {
            self.updateDom();
        }, this.config.updateInterval);
    },

    /**
     * @description Return the api link
     */
    getBalanceUrl: function () {
        return "https://api.etherscan.io/api?module=account&action=balancemulti&address=" + this.getAddresses() + "&tag=latest&apikey=" + this.config.apiKey
    },

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
    getData: function () {
        var self = this;

        var urlApi = self.getBalanceUrl();
        var retry = true;

        var dataRequest = new XMLHttpRequest();
        dataRequest.open("GET", urlApi, true);
        dataRequest.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    self.processData(JSON.parse(this.response));
                } else if (this.status === 401) {
                    self.updateDom(self.config.animationSpeed);
                    Log.error(self.name, this.status);
                    retry = false;
                } else {
                    Log.error(self.name, "Could not load data.");
                }
                if (retry) {
                    self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
                }
            }
        };
        dataRequest.send();
    },

    /**
     * @description Return wallet addresses
     */
    getAddresses: function () {
        let stringAddress = "";
        for (let index = 0; index < this.config.addresses.length; index++) {
            const address = this.config.addresses[index]["address"];
            stringAddress += address;
            if (index + 1 < this.config.addresses.length) {
                stringAddress += ",";
            }
        }
        return stringAddress;
    },

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
    scheduleUpdate: function (delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        nextLoad = nextLoad;
        var self = this;
        setTimeout(function () {
            self.getData();
        }, nextLoad);
    },

    /**
     * @description Create table
     */
    getDom: function () {
        var self = this;
        var wrapper = document.createElement("div");


        if (this.config.apiKey == "" || this.config.addresses.length == 0) {
            console.log("Please check config");
        }

        // If this.dataRequest is not empty
        if (this.dataRequest) {
            var divWrapper = document.createElement("div");
            let tableWrapper = document.createElement("table");
            tableWrapper.className = "small mmm-ethos-table";
            let tableHeadRow = self.createTableHead();
            tableWrapper.appendChild(tableHeadRow);
            let trWrapper = self.createTableData(this.dataRequest["result"], tableWrapper);
            tableWrapper.appendChild(trWrapper);
            divWrapper.appendChild(tableWrapper);
            wrapper.appendChild(divWrapper);
        }
        return wrapper;
    },

    /**
	 * @description Create header for table
	 */
    createTableHead: function () {
        let self = this;
        let tableHeadRow = document.createElement("tr");
        tableHeadRow.className = 'border-bottom';

        let tableHeadValues = [];
        tableHeadValues.push("Wallet");
        tableHeadValues.push("Balance");

        for (let thCounter = 0; thCounter < tableHeadValues.length; thCounter++) {
            let tableHeadSetup = document.createElement("th");
            tableHeadSetup.innerHTML = tableHeadValues[thCounter];

            tableHeadRow.appendChild(tableHeadSetup);
        }
        return tableHeadRow;
    },

    /**
	 * @description Create header for table
	 */
    createTableBlockHead: function () {
        let self = this;
        let tableHeadRow = document.createElement("tr");
        tableHeadRow.className = 'border-bottom';

        let tableHeadValues = [
            "Zeit",
            "Nr.",
            "Value"
        ];


        for (let thCounter = 0; thCounter < tableHeadValues.length; thCounter++) {
            let tableHeadSetup = document.createElement("th");
            tableHeadSetup.innerHTML = tableHeadValues[thCounter];

            tableHeadRow.appendChild(tableHeadSetup);
        }
        return tableHeadRow;
    },

    /**
	 * @description Create data for table
	 * @param {Object[]} wallets - List of wallets
	 * @param {*} tableWrapper 
	 */
    createTableData: function (wallets, tableWrapper) {
        let self = this;
        if (wallets.length > 0) {
            for (let index = 0; index < wallets.length; index++) {
                var trWrapper = document.createElement("tr");
                trWrapper.className = 'tr';

                let tdValues = [];

                if (this.config.addresses[index]["name"] !== "") {
                    tdValues.push(this.config.addresses[index]["name"]);
                } else {
                    tdValues.push(this.splitAddress(wallets[index]["account"]));
                }

                tdValues.push(this.getBalance(wallets[index]["balance"]) + " Ether",);

                for (let c = 0; c < tdValues.length; c++) {
                    var tdWrapper = document.createElement("td");
                    tdWrapper.innerHTML = tdValues[c];
                    trWrapper.appendChild(tdWrapper);
                }
                tableWrapper.appendChild(trWrapper);
            }
        }
        return trWrapper;
    },

    /**
	 * @description Create data for table
	 * @param {Object[]} wallets - List of wallets
	 * @param {*} tableWrapper 
	 */
    createTableBlockData: function (tableWrapper) {
        let self = this;
        let data = ["timeStamp", "blockNumber", "value"];
        if (self.blockData.length > 0) {
            for (let index = 0; index < self.blockData.length; index++) {
                var trWrapper = document.createElement("tr");
                trWrapper.className = 'tr';

                let tdValues = [];
                tdValues.push(this.timeConverter(self.blockData[index]["block"]["timeStamp"]));

                tdValues.push(self.blockData[index]["block"]["blockNumber"]);

                tdValues.push(this.getBalance(self.blockData[index]["block"]["value"]));

                for (let c = 0; c < tdValues.length; c++) {
                    var tdWrapper = document.createElement("td");
                    tdWrapper.innerHTML = tdValues[c];
                    trWrapper.appendChild(tdWrapper);
                }
                tableWrapper.appendChild(trWrapper);

            }
        }
        return trWrapper;
    },

    /**
     * 
     * @param {int} UNIX_timestamp 
     * @description Convert timestamp to Date
     */
    timeConverter: function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month;//+ ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    },

    /**
     * @description Convert the balance number
     * @param {int} balance Balance number
     * 
     */
    getBalance: function (balance) {
        return (parseInt(balance) / 1000000000000000000).toFixed(3);
    },

    /**
     * @description Split the wallet address for the table
     * @param {String} address Wallet address
     */
    splitAddress: function (address) {
        let stringAddress = "";
        for (let index = 2; index < 7; index++) {
            const element = address[index];
            stringAddress += element;
        }
        return stringAddress;
    },

    getStyles: function () {
        return [
            "MMM-Etherscan.css",
        ];
    },

    // Load translations files
    getTranslations: function () {

    },

    processData: function (data) {
        var self = this;
        this.dataRequest = data;
        if (this.loaded === false) { self.updateDom(self.config.animationSpeed); }
        this.loaded = true;

        // the data if load
        // send notification to helper
        // Gibt daten an node_helper weiter
        this.sendSocketNotification("MMM-TestNodeHelper-NOTIFICATION_TEST", "data");
        this.sendSocketNotification("GETBLOCK", this.config);
    },


    notificationReceived: function (notification, payload, sender) {
        /*
        console.log("Notification");
        console.log("noti = "+ notification + " payload = "+payload + " sender = " + sender);
        console.log(sender);
        */
    },

    /**
     * @description Save blockdata from node_helper
     * @param {*} notification 
     * @param {*} payload 
     */
    socketNotificationReceived: function (notification, payload) {
        if (notification === "BLOCKDATA") {
            // set dataNotification

            this.blockData = payload;
            this.updateDom();
        }
    },
});