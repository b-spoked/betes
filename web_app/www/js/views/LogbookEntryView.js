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

    events: {
        'click .update': 'editEntry',
        'click .delete-entry': 'deleteEntry'
    },
    initialize: function() {
    	this.template = _.template($('#logbookitem-template').html());
    	
        _.bindAll(this);
        this.model.bind('change', this.render, this);
        this.model.bind("destroy", this.close, this);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    editEntry: function(e) {
        var view = new EditLogbookEntryModal({model:this.model});
        view.render();

        var $modalEl = $("#modal-dialog");
        $modalEl.html(view.el);
        view.showDialog();
    },
    deleteEntry: function() {
        this.model.destroy();
    }
});