var BADGE_COLOR = [231, 76, 60, 255],
    ICON_ONLINE = {
        "19": "/assets/logo19.png",
        "38": "/assets/logo38.png"
    },
    ICON_OFFLINE = {
        "19": "/assets/logo19_offline.png",
        "38": "/assets/logo38_offline.png"
    },

    Vow = require('vow'),
    Env = require('env/env.js'),

    browserAction;

// Set up popup and popup comminication
if (Env.firefox) {
    var data = require('sdk/self').data;

    browserAction = require('browserAction').BrowserAction({
        default_icon: data.url(ICON_ONLINE['19']),
        default_title: 'VKfox',
        default_popup: data.url('pages/popup.html')
    });
} else {
    browserAction = chrome.browserAction;
}

browserAction.setBadgeBackgroundColor({color: BADGE_COLOR});

module.exports = {
    getBrowserAction: function () {
        return browserAction;
    },
    /**
     * Sets icon to online status
     */
    setIconOnline: function () {
        browserAction.setIcon({path: ICON_ONLINE});
    },
    /**
     * Sets icon to offline status
     */
    setIconOffline: function () {
        browserAction.setIcon({path: ICON_OFFLINE});
    },
    /**
     * @param {String|Number} text
     */
    setBadgeText: function (text) {
        browserAction.setBadgeText({
            text: String(text)
        });
    },
    /**
     * Says whether popup is visible
     *
     * @returns {Boolean}
     */
    isPopupOpened: function () {
        if (Env.firefox) {
            // TODO fix stub
            return false;
        } else {
            return Boolean(chrome.extension.getViews({type: "popup"}).length);
        }
    },
    /**
     * Says whether vk.com is currently active tab
     *
     * @returns {Vow.promise} Returns promise that resolves to Boolean
     */
    isVKSiteActive: function () {
        var promise = Vow.promise();

        if (Env.firefox) {
            // TODO fix stub
            promise.fulfill(false);
        } else {
            chrome.tabs.query({active: true}, function (tabs) {
                if (tabs.every(function (tab) {
                    return tab.url.indexOf('vk.com') === -1;
                })) {
                    promise.fulfill(false);
                } else {
                    promise.fulfill(true);
                }
            });
        }

        return promise;
    }
};
