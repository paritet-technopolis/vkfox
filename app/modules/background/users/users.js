angular.module('users', ['request']).factory('Users', function (Request) {
    var
    DROP_PROFILES_INTERVAL = 30000,
    USERS_GET_DEBOUNCE = 400,

    usersColl = new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            idAttribute: 'id'
        })
    }))(),
    // TODO problem when dropped between onGet and response
    dropOldNonFriendsProfiles = _.debounce(function () {
        usersColl.remove(usersColl.filter(function (model) {
            return !model.get('isFriend');
        }));
        dropOldNonFriendsProfiles();
    }, DROP_PROFILES_INTERVAL),
    usersGetQueue = [],
    processGetUsersQueue = _.debounce(function () {
        var newUids = _.chain(usersGetQueue).pluck('uids').flatten()
            .unique().difference(usersColl.pluck('id')).value();

        console.log('newUids', newUids.length);
        if (newUids.length) {
            Request.api({
                // TODO limit for uids.length
                code: 'return API.users.get({uids: "' + newUids.join() + '", fields : "online, photo,sex,nickname,lists"})'
            }).then(function (response) {
                console.log(response);
                if (response && response.length) {
                    usersColl.add(response);
                    publishUids();
                }
            }.bind(this));
        } else {
            publishUids();
        }
    }, USERS_GET_DEBOUNCE),
    publishUids = function () {
        var data, queueItem;

        function getProfileById(uid) {
            console.log(uid, usersColl);
            return _.clone(usersColl.get(Number(uid)));
        }

        while (usersGetQueue.length) {
            queueItem = usersGetQueue.pop();
            data = queueItem.uids.map(getProfileById, this);

            if (data.length === 1) {
                queueItem.deferred.resolve(data[0]);
            } else {
                queueItem.deferred.resolve(data);
            }
        }
    };

    dropOldNonFriendsProfiles();


    return {
        getFriendsProfiles: function () {
            if (!this._friendsProfilesDefer) {
                this._friendsProfilesDefer = Request.api({
                    code: 'return API.friends.get({ fields : "photo,sex,nickname,lists", order: "hints" })'
                }).then(function (response) {
                    if (response && response.length) {
                        response.forEach(function (friendData) {
                            friendData.isFriend = true;
                        });
                        usersColl.add(response);
                    }
                    return response;
                }.bind(this));
            }

            return this._friendsProfilesDefer;
        },
        /**
         * Returns profiles by ids
         * @param [Array<<Number>>|Number] uids Array of user's uds
         *
         * @returns {jQuery.Deferred} Returns promise that will be fulfilled with profiles
         */
        getProfilesById: function (uids) {
            return this.getFriendsProfiles().then(function () {
                var deferred = jQuery.Deferred();

                usersGetQueue.push({
                    uids: uids,
                    deferred: deferred
                });
                processGetUsersQueue();
                return deferred;
            });
        }
    };
});