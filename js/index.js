angular
.module('app', ['pubnub.angular.service'])

.controller('ChatCtrl', ['$scope', 'Pubnub', function($scope, Pubnub) {
    $scope.messages = [];
    $scope.channel = 'messages-channel';
	$scope.username='';
	$scope.userData='';
	
	var client = new ApiAi.ApiAiClient({accessToken: 'e9903f1c851c45358cbedeac989fdc8d '});
    $scope.messageContent = '';
    // Generating a random uuid between 1 and 100 using utility function from lodash library.
    $scope.uuid = _.random(1000000).toString();
 
    // Please signup to PubNub to use your own keys: https://admin.pubnub.com/
    Pubnub.init({
        publish_key: 'pub-c-47b8d6e0-19d7-4ce3-be7c-2010bfa10f81',
        subscribe_key: 'sub-c-003157f4-be4e-11e7-b568-cae0e0582227',
        ssl: true,
        uuid: $scope.uuid
    });

    // Fetching a uniq random avatar from the robohash.org service.
    $scope.avatarUrl = function(uuid) {
        return '//robohash.org/' + uuid + '?set=set2&bgset=bg2&size=70x70';
    };
	$scope.setUserName = function(data) {
        $scope.username=data;
    };
    // Send the messages over PubNub Network
    $scope.sendMessage = function(messageContent) {
       // Don't send an empty message 
	   $scope.messageContent=messageContent;
       if (!$scope.messageContent ||
            $scope.messageContent === '') {
            return;
        }
		
        Pubnub.publish({
            channel: $scope.channel,
            message: {
				imageUrl:$scope.avatarUrl($scope.uuid),
				name:$scope.username,
                content: $scope.messageContent,
                sender_uuid: $scope.uuid,
                date: new Date()
            }
        });


        // Reset the messageContent input
        $scope.messageContent = '';

    }

    // Subscribe to messages channel
    Pubnub.subscribe({
        channel: $scope.channel,
        triggerEvents: ['callback']
    });

    // Make it possible to scrollDown to the bottom of the messages container
    $scope.scrollDown = function(time) {
        var $elem = $('.collection');
        $('body').animate({
            scrollTop: $elem.height()
        }, time);
    };
$scope.scrollDown(400);
// Listenning to messages sent.
    $scope.$on(Pubnub.getMessageEventNameFor($scope.channel), function(ngEvent, m) {
        $scope.$apply(function() {
			
            $scope.messages.push(m);
			var promise= client.textRequest(m.content);
			promise
    .then(handleResponse)
    .catch(handleError);

function handleResponse(serverResponse) {
        console.log(serverResponse);
		$scope.$apply(function() {
		$scope.messages.push({
			imageUrl:$scope.avatarUrl(serverResponse.id),
			name:"Sparkie",
			sender_uuid:serverResponse.id,
			date:serverResponse.timestamp,
			content:serverResponse.result.fulfillment.speech
		});
		});
}
function handleError(serverError) {
        console.log(serverError);
}
			$scope.messages.push();
        });
        $scope.scrollDown(400);
    });
}]);
