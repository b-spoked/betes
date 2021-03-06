/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:49 PM
 * To change this template use File | Settings | File Templates.
 */
window.AddEntryView = Backbone.View.extend({
    
	events: {
        'click .add-entry': 'saveNewEntry'
    },
    initialize: function() {
    	this.template = _.template($('#add-logbookitem-template').html());
    },

    render: function() {
    	$(this.el).html(this.template(this.model.toJSON()));
    	_.defer(function(view) {
			view.setDefaults();
		}, this);
        return this;
    },
    setDefaults: function() {
        var local = new Date();
        var date = new Date();
        local.setHours(date.getHours() + (date.getTimezoneOffset() / -60));
        $('#entry-date').val(local.toJSON().substring(0, 19).replace('T', ' '));
    },
    loadLogBook:function(){
    	Backbone.history.navigate('#/timeline');
    	window.location.reload();
    },
    saveNewEntry: function(e) {

    	//e.preventDefault();
    	
    	this.model.logEntries.create( {
            name: $("#entry-name").val().trim(),
            glucoseLevel: $("#entry-level").val().trim(),
            resultDate: $("#entry-date").val().trim(),
            insulinAmount: $("#entry-insulin").val().trim(),
            exerciseDuration: $("#entry-exercise-duration").val().trim(),
            exerciseIntensity: $("#entry-exercise-intensity").val().trim(),
            labels: $("#entry-labels").val().trim(),
            comments: $("#entry-comments").val().trim(),
            userId : this.model.get('sid')
        });
    	
    	this.loadLogBook();
    	   
    }
});