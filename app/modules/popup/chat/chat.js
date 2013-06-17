angular.module('chat', ['item'])
    .controller('ChatCtrl', function ($scope, mediator) {
        mediator.pub('chat:data:get');
        mediator.sub('chat:data', function (data) {
            $scope.$apply(function () {
                $scope.data = data.dialogs.map(function (dialog) {
                    var messageAuthorId = dialog.messages[0].uid, result = {};

                    if ((dialog.chat_id || dialog.uid !== messageAuthorId)) {
                        result.author = _(dialog.profiles).findWhere({
                            id: messageAuthorId
                        });
                    }
                    if (dialog.chat_id) {
                        result.owners = dialog.profiles;
                    } else {
                        result.owners = _(dialog.profiles).findWhere({
                            id: dialog.uid
                        });
                    }

                    result.messages = dialog.messages;
                    result.chat_id = dialog.chat_id;
                    result.uid = dialog.uid;

                    return result;
                });
            });
        }.bind(this));
    });
