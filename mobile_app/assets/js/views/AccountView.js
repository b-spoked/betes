/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:57 PM
 * To change this template use File | Settings | File Templates.
 */
//Users account
window.AccountView = Backbone.View.extend({
    accountTemplate: _.template($('#account-template').html()),

    events: {
        'click #save-profile': 'saveProfile',
        'click .add-new-goals': 'showAddGoalsDialog'
    },
    initialize: function() {
        $(this.el).html(this.accountTemplate(this.model.toJSON()));

        _.bindAll(this);
        app.User.userGoals.bind('add', this.addOne, this);
        app.User.userGoals.bind('reset', this.addAll, this);
        app.User.userGoals.bind('remove', this.refresh, this);
        app.User.userGoals.fetch();
    },
    render: function() {

        $(this.el).hide();
    },
    close: function() {
        this.remove();
        this.unbind();
    },
    onShow: function() {
        $("#profile-saved-message").hide();
        $('#user-tabs a:first').tab('show');
        $(this.el).show(500);
    },
    refresh: function() {
        app.User.userGoals.fetch();
        this.render();
        this.onShow();
    },
    addOne: function(goal) {
        var goalSetView = new app.GoalSetView({
            model: goal
        });
        this.$('#goals-list').append(goalSetView.render().el);
    },
    addAll: function(goals) {
        if (goals == null) {
            goals = app.User.userGoals.fetch();
        }
        if (goals != null) {
            this.$('#goals-list').html('');
            goals.each(this.addOne, this);
        }
    },
    userProfileValues: function() {
        return {
            name: $("#account-user-name").val().trim(),
            email: $("#account-user-email").val().trim(),
            pw: $("#account-user-pw").val().trim(),
            testingUnits: $("#account-testing-units").val().trim()
        };
    },
    saveProfile : function(e) {
        e.preventDefault();
        this.model.set(this.userProfileValues());
        this.model.save();
        $("#profile-saved-message").show();
    },
    showAddGoalsDialog : function(e) {
        var goalSetDialog = new app.AddGoalSetView();
        goalSetDialog.render();

        var $modalEl = $("#modal-goal");
        $modalEl.html(goalSetDialog.el);
        goalSetDialog.showDialog();
    }

});