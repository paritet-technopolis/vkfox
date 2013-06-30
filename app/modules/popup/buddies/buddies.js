angular.module('buddies', ['i18n', 'item-list'])
    .controller('buddiesCtrl', function ($scope, $element, mediator) {
        $scope.filters = {
            male: true,
            female: true,
            offline: false
        };

        mediator.pub('buddies:data:get');
        mediator.sub('buddies:data', function (data) {
            $scope.$apply(function () {
                $scope.data = data;
            });
        }.bind(this));
    })
    .filter('buddiesFilter', function ($filter) {
        /**
         * Says if profile matched search clue.
         * Uses lowercasing of arguments
         *
         * @params [Object] profile
         * @param [String] searchClue
         *
         * @returns [Boolean]
         */
        function matchProfile(profile, searchClue) {
            return $filter('name')(profile)
                .toLowerCase()
                .indexOf(searchClue.toLowerCase()) !== -1;
        }
        /**
         * @param [Array] input profiles array
         * @param [Object] filters Filtering rules
         * @param [Boolean] filters.male If false, no man will be returned
         * @param [Boolean] filter.female
         * @param [Boolean] filters.offline
         * @param [Number] count Maximum number filtered results
         * @param [String] searchClue Search clue
         *
         * @returns [Array]
         */
        return function (input, filters, count, searchClue) {
            if (Array.isArray(input)) {
                return input.filter(function (profile) {
                    return (filters.offline || profile.online) && (
                        (filters.male || profile.sex !== 2)
                        && (filters.female || profile.sex !== 1)
                    ) && (!searchClue || matchProfile(profile, searchClue));
                });
            }
        };
    });

