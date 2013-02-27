/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:55 PM
 * To change this template use File | Settings | File Templates.
 */
window.NavigationView = Backbone.View.extend({

        el: "#app-nav",

        events: {
            'click #login': 'showLoginDialog'
        },

        navigationTemplate: _.template($('#nav-template').html()),

        initialize: function() {
            this.getCurrentUser();
            _.bindAll(this, "render");
            app.User.bind('change:authenticated', this.render, this);
            this.render();
        },
        render: function() {
            $(this.el).html(this.navigationTemplate(app.User.toJSON()));
            return this;
        },

        showLoginDialog:  function(e) {
            var loginDialog = new app.LoginView();
            loginDialog.render();
            var $modalEl = $("#modal-dialog");
            $modalEl.html(loginDialog.el);
            loginDialog.showDialog();
        },
        getCurrentUser:function() {
            var user,
                users;

            app.Users = new UserDetails();

            app.Users.fetch({local: true});
            app.User = app.Users.first();

            if (!app.User) {
                app.Users.add(new User());
                app.User = app.Users.first();
            } else if ((app.User.get('id') > 0) && (app.User.get('authenticated'))) {
                app.Users.storage.sync.push();

            }

        }

    });