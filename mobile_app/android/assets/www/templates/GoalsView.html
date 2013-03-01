/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:58 PM
 * To change this template use File | Settings | File Templates.
 */
window.GoalsView = Backbone.View.extend({

    //... is a list tag.
    tagName:  'tr',

    rowTemplate: _.template($('#goal-template').html()),

    events: {
        'click .update-goals': 'updateGoals',
        'click .delete-goals': 'deleteGoals'
    },
    initialize: function() {
        _.bindAll(this);
        this.model.on('change', this.render, this);
    },
    render: function() {
        this.$el.html(this.rowTemplate(this.model.toJSON()));
        return this;
    },
    updateGoals: function(e) {
        var view = new app.EditGoalsView({model:this.model});
        view.render();

        var $modalEl = $("#modal-dialog");
        $modalEl.html(view.el);
        view.showDialog();
    },
    deleteGoals: function() {
        this.model.destroy();
    }
});