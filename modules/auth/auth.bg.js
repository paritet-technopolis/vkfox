angular.module('auth', ['config']).run(function (Auth) {
    Auth.login();
}).factory('Auth', function (Mediator, AUTH_DOMAIN, AUTH_URI) {
    var RETRY_INTERVAL = 10000, //ms
        CREATED = 1,
        IN_PROGRESS = 1,
        READY = 2,

        $iframe, model = new Backbone.Model(),
        Auth,
        state = CREATED, authDeferred = jQuery.Deferred();

    Mediator.sub('auth:iframe', function (url) {
        try {
            model.set('userId',  parseInt(url.match(/user_id=(\w+)(?:&|$)/i)[1], 10));
            model.set('accessToken',  url.match(/access_token=(\w+)(?:&|$)/i)[1]);

            // close all login windows
            chrome.tabs.query({url: AUTH_DOMAIN + '*'}, function (tabs) {
                tabs.forEach(function (tab) {
                    chrome.tabs.remove(tab.id);
                });
            });

            $iframe.remove();
            // save memory
            $iframe = null;
        } catch (e) {
            // TODO control console.log
            console.log(e);
        }
    }.bind(this));

    Mediator.sub('auth:state:get', function () {
        Mediator.pub('auth:state', state);
    });

    Mediator.sub('auth:oauth', function () {
        chrome.tabs.create({url: AUTH_URI});
    });

    Mediator.sub('auth:login', function (force) {
        Auth.login(force);
    });

    model.on('change:accessToken', function () {
        Mediator.pub('auth:success', model.toJSON());
    });

    Auth = {
        retry: _.debounce(function () {
            if (state === IN_PROGRESS) {
                this.login(true);
                this.retry();
            }
        }, RETRY_INTERVAL),
        onSuccess: function (data) {
            state = READY;

            chrome.browserAction.setIcon({
                path: {
                    "19": "/images/logo19.png",
                    "38": "/images/logo38.png"
                }
            });

            authDeferred.resolve(data);
        },
        login: function (force) {
            if (force || state === CREATED) {
                chrome.browserAction.setIcon({
                    path: {
                        "19": "/images/logo19_offline.png",
                        "38": "/images/logo38_offline.png"
                    }
                });
                state = IN_PROGRESS;

                if (authDeferred.state() === 'resolved') {
                    authDeferred = jQuery.Deferred();
                }

                if (!$iframe) {
                    $iframe = angular.element(
                        '<iframe/>',
                        {name : 'vkfox-login-iframe'}
                    ).appendTo('body');
                }
                $iframe.attr('src', AUTH_URI);
                this.retry();

                Mediator.unsub('auth:success', this.onSuccess);
                Mediator.once('auth:success', this.onSuccess);
            }
            return authDeferred;
        },
        getAccessToken: function () {
            return this.login().then(function () {
                return model.get('accessToken');
            });
        },
        getUserId: function () {
            return this.login().then(function () {
                return model.get('userId');
            });
        }
    };

    return Auth;
});