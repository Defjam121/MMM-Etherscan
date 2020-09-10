/* Magic Mirror
 * Node Helper: MMM-Etherscan
 *
 * By Marc Helpenstein
 * MIT Licensed.
 */

/**
* @external node-fetch
* @see https://www.npmjs.com/package/node-fetch
*/
const fetch = require('node-fetch');

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    // Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
    socketNotificationReceived: async function (notification, payload) {
        if (notification === "GETBLOCK") {
            this.getBlockData(payload);
        }

    },

    // Example function send notification test
    sendNotificationTest: function (payload) {
        this.sendSocketNotification("MMM-Etherscan-NOTIFICATION_TEST", "payload test node helper");
    },

    // this you can create extra routes for your module
    extraRoutes: function () {
        var self = this;
        this.expressApp.get("/MMM-Etherscan/extra_route", function (req, res) {
            // call another function
            values = self.anotherFunction();
            res.send(values);
        });
    },

    getBlockData: async function (config) {
        let blocks = [];

        for (let index = 0; index < config["addresses"].length; index++) {
            const address = config["addresses"][index];
            const response = await fetch("https://api.etherscan.io/api?module=account&action=txlist&address=" + address["address"] + "&startblock=0&endblock=99999999&sort=asc&apikey=" + config["apiKey"]);
            const parsedResponse = await response.json();
            let lastBlock = parsedResponse.result[parsedResponse.result.length - 1]
            let entry = {
                "name": address["name"],
                "address": address["address"],
                "block": lastBlock,
            }
            blocks.push(entry);
        }
        this.sendSocketNotification("BLOCKDATA", blocks);
    },

    // Test another function
    anotherFunction: function () {
        return { date: new Date() };
    }
});