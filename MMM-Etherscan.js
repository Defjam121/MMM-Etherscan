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
        addresses: [],
        apiKey: "",
    },

    requiresVersion: "2.1.0", // Required version of MagicMirror

    start: function () {
        var self = this;
        var dataRequest = null;
        var dataNotification = null;

        //Flag for check if module is loaded
        this.loaded = false;

        // Schedule update timer.
        this.getData();
        setInterval(function () {
            self.updateDom();
        }, this.config.updateInterval);
    },

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
            console.log(this.readyState);
            if (this.readyState === 4) {
                console.log(this.status);
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

    getAddresses: function () {
        let stringAddress = "";
        for (let index = 0; index < this.config.addresses.length; index++) {
            const address = this.config.addresses[index];
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

    getDom: function () {
        var self = this;

        let tableWrapper = document.createElement("table");
        tableWrapper.className = "small mmm-ethos-table";

        if (this.config.apiKey == "" || this.config.addresses.length == 0) {
            console.log("Please check config");
        }

        // If this.dataRequest is not empty
        if (this.dataRequest) {
            let tableHeadRow = self.createTableHead();
            tableWrapper.appendChild(tableHeadRow);
            let trWrapper = self.createTableData(this.dataRequest["result"], tableWrapper);
            tableWrapper.appendChild(trWrapper);
        }
        return tableWrapper;
    },

    /**
	 * @description Create header for table
	 */
    createTableHead: function () {
        let self = this;
        let tableHeadRow = document.createElement("tr");
        tableHeadRow.className = 'border-bottom';

        let tableHeadValues = [];
        tableHeadValues.push("Address");
        tableHeadValues.push("Balance");

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

                let tdValues = [
                    this.splitAddress(wallets[index]["account"]),
                    this.getBalance(wallets[index]["balance"]) + " Ether",
                ];

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

    getBalance: function (balance) {
        return (parseInt(balance)/1000000000000000000).toFixed(3);
    },

    splitAddress: function(address) {
        let stringAddress = "";
        for (let index = 2; index < 7; index++) {
            const element = address[index];
            stringAddress+=element;
        }
        return stringAddress;
    },

    getScripts: function () {
        return [];
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
    },


    notificationReceived: function (notification, payload, sender) {
        /*
        console.log("Notification");
        console.log("noti = "+ notification + " payload = "+payload + " sender = " + sender);
        console.log(sender);
        */
    },
    // socketNotificationReceived from helper
    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-TestNodeHelper-NOTIFICATION_TEST") {
            // set dataNotification
            //console.log("Data from node_helper = "+ payload);

        }
    },
});