/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:59 PM
 * To change this template use File | Settings | File Templates.
 */
//Add goalset
window.AddGoalsView = Backbone.View.extend({
    addGoalsTemplate: _.template($('#add-goal-template').html()),

    events: {
        'click .add-goal': 'saveNewGoals'
    },

    render: function() {
        $(this.el).html(this.addGoalsTemplate());
        return this;
    },

    showDialog: function() {
        $("#add-goal-dialog").modal('show');
    },
    saveNewGoals:function() {

        app.User.userGoals.create(this.newGoalValues());
        $("#add-goal-dialog").modal('hide');
    },

    newGoalValues: function() {
        return {
            bsLowerRange: $("#goal-bs-lower").val().trim(),
            bsUpperRange: $("#goal-bs-upper").val().trim(),
            bsFrequency: $("#goal-bs-frequency").val().trim(),
            exerciseDuration: $("#goal-exercise-duration").val().trim(),
            exerciseFrequency: $("#goal-exercise-frequency").val().trim(),
            longTermGoal: $("#goal-long-term").val().trim(),
            longTermGoalDate: $("#goal-long-term-date").val().trim()
        };
    }

});