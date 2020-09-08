/* Magic Mirror
 * Node Helper: MMM-Etherscan
 *
 * By Marc Helpenstein
 * MIT Licensed.
 */

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
        if (notification === "MMM-TestNodeHelper-NOTIFICATION_TEST") {
            console.log("Working notification system. Notification:", notification, "payload: ", payload);
            // Send notification
            // Send test
            this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
        }

    },

    // Example function send notification test
    sendNotificationTest: function (payload) {
        this.sendSocketNotification("MMM-TestNodeHelper-NOTIFICATION_TEST", "payload test node helper");
    },

    // this you can create extra routes for your module
    extraRoutes: function () {
        var self = this;
        this.expressApp.get("/MMM-TestNodeHelper/extra_route", function (req, res) {
            // call another function
            values = self.anotherFunction();
            res.send(values);
        });
    },

    // Test another function
    anotherFunction: function () {
        return { date: new Date() };
    }
});