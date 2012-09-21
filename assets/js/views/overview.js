var OverviewView = Backbone.View.extend({
  initialize: function() {
    this.render();

    navigator.id.watch({
      loggedInEmail: null,
      onlogin: function(assertion) {
        console.log('login');
        irc.socket.emit('login_persona', {
          assertion: assertion,
        });
      },
      onlogout: function() {
        console.log('logout');
        irc.socket.disconnect();
      }
    });
  },

  events: {
    'click #connect-button': 'connect',
    'click #connect-more-options-button': 'more_options',
    'click #login-button': 'login_register',
    'click #persona-login': 'login_persona',
    'click #register-button': 'login_register',
    'keypress': 'connectOnEnter',
    'click #connect-secure': 'toggle_ssl_options',
  },

  el: '.content',

  render: function(event) {
    $(this.el).html(ich.overview());

    // Navigation to different overview panes
    if (event === undefined) {
      $('#overview').html(ich.overview_home());
    } else {
      var func = ich['overview_' + event.currentTarget.id];
      $('#overview').html(func());
    }

    $('.overview_button').bind('click', $.proxy(this.render, this));
    return this;
  },

  connectOnEnter: function(event) {
    if (event.keyCode !== 13) return;
    if($('#connect-button').length){
      this.connect(event);
    }
    if($('#login-button').length){
      event.action= 'Login';
      this.login_register(event);
    }
    if($('#register-button').length){
      event.action = 'Register';
      this.login_register(event);
    }
  },

  connect: function(event) {
    event.preventDefault();
    $('.error').removeClass('error');

    var server = $('#connect-server').val(),
    nick = $('#connect-nick').val(),
    port = $('#connect-port').val(),
    away = $('#connect-away').val(),
    realName = $('#connect-realName').val() || nick,
    secure = $('#connect-secure').is(':checked'),
    selfSigned = $('#connect-selfSigned').is(':checked'),
    rejoin = $('#connect-rejoin').is(':checked'),
    password = $('#connect-password').val();

    if (!server) {
      $('#connect-server').closest('.control-group').addClass('error');
    }

    if (!nick) {
      $('#connect-nick').closest('.control-group').addClass('error');
    }

    if (nick && server) {
      $('form').append(ich.load_image());
      $('#connect-button').addClass('disabled');

      var connectInfo = {
        nick: nick,
        server: server,
        port: port,
        secure: secure,
        selfSigned: selfSigned,
        rejoin: rejoin,
        away: away,
        realName: realName,
        password: password
      };

      irc.me = new User(connectInfo);
      irc.me.on('change:nick', irc.appView.renderUserBox);
      irc.socket.emit('connect', connectInfo);
    }
  },

  more_options: function() {
    this.$el.find('.connect-more-options').toggleClass('hide');
  },

  login_register: function(event) {
    var action = event.target.innerHTML.toLowerCase() || event.action.toLowerCase();
    event.preventDefault();
    $('.error').removeClass('error');

    var username = $('#' + action + '-username').val();
    var password = $('#' + action + '-password').val();

    if (!username) {
      $('#' + action + '-username').closest('.clearfix').addClass('error');
      $('#' + action + '-username').addClass('error');
    }

    if (!password) {
      $('#' + action + '-password').closest('.clearfix').addClass('error');
      $('#login-password').addClass('error');
    }

    if(username && password){
      $('form').append(ich.load_image());
      $('#' + action + '-button').addClass('disabled');
    }

    irc.socket.emit(action, {
      username: username,
      password: password
    });
  },

  login_persona: function(event) {
    navigator.id.request();
  },

  toggle_ssl_options: function(event) {
    var port = $('#connect-secure').is(':checked') ? 6697 : 6667 ;
    $('#connect-port').attr('placeholder', port);
    $('#ssl-self-signed').toggle();
  }
});
