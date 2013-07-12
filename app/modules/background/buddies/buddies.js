angular.module(
    'buddies',
    ['users', 'request', 'mediator', 'persistent-set', 'profiles-collection']
).run(function (Users, Request, Mediator, PersistentSet, ProfilesCollection) {
    var readyDeferred = jQuery.Deferred(),
        watchedBuddiesSet = new PersistentSet('watchedBuddies'),
        buddiesColl = new (ProfilesCollection.extend({
            model: Backbone.Model.extend({
                idAttribute: 'uid'
            }),
            comparator: function (buddie) {
                if (buddie.get('isWatched')) {
                    return -2;
                } else if (buddie.get('isFave')) {
                    return -1;
                } else {
                    return buddie.get('originalIndex') || 0;
                }
            }
        }))();

    /**
     * After changing and unchanging any field of buddie,
     * we need to place it to original place in list,
     * So we add index property.
     * Runs once.
     */
    function saveOriginalBuddiesOrder() {
        var length = buddiesColl.length;

        if (length && !buddiesColl.at(length - 1).get('originalIndex')) {
            buddiesColl.forEach(function (buddie, i) {
                buddie.set('originalIndex', i);
            });
        }
    }

    /**
     * Returns profiles from bookmarks,
     * and sets "isFave=true" on profile object
     *
     * @returns [jQuery.Deferred]
     */
    function getFavouriteUsers() {
        return Request.api({
            code: 'return API.fave.getUsers()'
        }).then(function (response) {
            return Users.getProfilesById(
                _.pluck(response.slice(1),
                'uid'
            )).then(function (profiles) {
                profiles.forEach(function (profile) {
                    profile.isFave = true;
                });
                return profiles;
            });
        });
    }

    jQuery.when(
        getFavouriteUsers(),
        Users.getFriendsProfiles()
    ).then(function (favourites, friends) {
        buddiesColl.add(favourites);
        buddiesColl.add(friends);

        saveOriginalBuddiesOrder();

        watchedBuddiesSet.toArray().forEach(function (uid) {
            var model = buddiesColl.get(uid);
            if (model) {
                model.set('isWatched', true);
            }
        });
        // resort if any profile was changed
        if (watchedBuddiesSet.size()) {
            buddiesColl.sort();
        }
        readyDeferred.resolve();
    });

    Mediator.sub('buddies:data:get', function () {
        readyDeferred.then(function () {
            Mediator.pub('buddies:data', buddiesColl.toJSON());
        });
    });
    readyDeferred.then(function () {
        buddiesColl.on('change', function () {
            Mediator.pub('buddies:data', buddiesColl.toJSON());
        });
    });

    Mediator.sub('buddies:watch:toggle', function (uid) {
        if (watchedBuddiesSet.contains(uid)) {
            watchedBuddiesSet.remove(uid);
            buddiesColl.get(uid).unset('isWatched');
        } else {
            watchedBuddiesSet.add(uid);
            buddiesColl.get(uid).set('isWatched', true);
        }
        if (buddiesColl.get(uid).hasChanged()) {
            buddiesColl.sort();
            Mediator.pub('buddies:data', buddiesColl.toJSON());
        }
    });
});
