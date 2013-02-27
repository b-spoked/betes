/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */
window.LogBookEntryView = Backbone.View.extend({
    
    tagName:  'tr',

    className: 'success',

    rowTemplate: _.template($('#item-template').html()),

    events: {
        'click .update': 'editEntry',
        'click .delete': 'deleteEntry'
    },
    initialize: function() {
        _.bindAll(this);
        this.model.on('change', this.render, this);
    },
    render: function() {
        this.$el.html(this.rowTemplate(this.model.toJSON()));
        return this;
    },
    editEntry: function(e) {
        var view = new EditLogbookEntryView({model:this.model});
        view.render();

        var $modalEl = $("#modal-dialog");
        $modalEl.html(view.el);
        view.showDialog();
    },
    deleteEntry: function() {
        this.model.destroy();
    }
});