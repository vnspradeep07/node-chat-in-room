$(function(){
    
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $selRoomInput = $('#sel_room'); // Input for room
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $currentInput = $selRoomInput.focus();
    var $joinButton = $('#joinme');
    var $messages = $('.messages'); // Messages area
    
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    
    var selectedRooms = chatUser = '';
    // create client socket instance
    var socket = io.connect('http://localhost:8081');
    
    var addUserAndRoom = function(roomname,user) {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
        socket.emit('adduser', user, roomname);
    }
    var urlPath = window.location.pathname;
    var urlPath = urlPath.substring(6);
    urlPath = urlPath.split('/');
    if(urlPath.length == 2) {
        addUserAndRoom(urlPath[0],urlPath[1]);
        selectedRooms = urlPath[0];
        chatUser = urlPath[1];
    }
    // Click events
    // entry point inside chat section 1
    // Focus input when clicking anywhere on login page
    $loginPage.click(function() {
        $currentInput.focus();
    });
    
    // Gets the color of a username through our hash function
    var getUsernameColor = function(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }
    
    // Adds the visual chat message to the message list
    var addChatMessage = function(username, data, options) {
        console.log(arguments);        
        options = options || {};
        var $usernameDiv = $('<span class="username"/>')
                .text(username)
                .css('color', getUsernameColor(username));
        var $messageBodyDiv = $('<span class="messageBody">')
                .text(data);

        //var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
                .data('username', username)
                .addClass('')
                .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }
    
    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    var addMessageElement = function(el, options) {
        var $el = $(el);
        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            //$el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }
    
    //Upload available rooms
    socket.on('allrooms', function(data) {
        var list = $('#sel_room')[0]; // HTMLSelectElement
        $.each(data, function(index, text) {
            list.options[list.options.length] = new Option(text,index);
        });
        console.log(data);
    });
    
    // Display room users list in the dropdown
    $selRoomInput.on('change', function(obj) {
        selectedRooms = $(this).val();
        if(selectedRooms) {
            var roomUsers = $(this).find("option:selected").text();
            roomUsers = roomUsers.split(',');
            var list = $('#username')[0]; // HTMLSelectElement
            $.each(roomUsers,function(index,text){
                list.options[list.options.length] = new Option(text,text);
            })
        }
        else {
            $('option', '#username').not(':eq(0)').remove();
        }
    });
    
    $joinButton.on('click',function(){
        chatUser = $('#username').val();        
        if(selectedRooms && chatUser) {            
            addUserAndRoom(selectedRooms,chatUser);
            window.location.href="/chat/"+selectedRooms+'/'+chatUser;
        }
        else {
            alert('please select room and username');
        }
    });
    
    // on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		//socket.emit('adduser', prompt("What's your name?"));
	});

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
        console.log(arguments);
        addChatMessage(username, data);
		//$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
	});

	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '('+ key +')' +'</div>');
			}
			else {
				$('#rooms').append('<div><a href="/chat/'+key+'/'+chatUser+'">' + value + '</a></div>');
			}
		});
	});

	/*function switchRoom(room){
		socket.emit('switchRoom', room);
	}*/
	
	// on load of page

		// when the client clicks SEND
		$('#datasend').on('click', function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').on('keypress',function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});

});

