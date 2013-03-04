/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:49 PM
 * To change this template use File | Settings | File Templates.
 */
window.AddLogbookEntryModal = Backbone.View.extend({
    
	events: {
        'click .add-entry': 'saveNewEntry'
    },
    initialize: function() {
    	this.template = _.template($('#add-logbookitem-template').html());
    },

    render: function() {
    	$(this.el).html(this.template());
        return this;
    },

    showDialog: function() {
        var local = new Date();
        var date = new Date();
        local.setHours(date.getHours() + (date.getTimezoneOffset() / -60));
        $('#entry-date').val(local.toJSON().substring(0, 19).replace('T', ' '));
        $("#add-entry-dialog").modal('show');
    },
    saveNewEntry:function() {
        var logEntry = new Entry(this.entryValues());
        this.model.logEntries.create(logEntry);
        //logEntry.save();
        //app.User.logEntries.create(logEntry, {local:true});

        $("#add-entry-dialog").modal('hide');
    },

    entryValues: function() {
        return {
            name: $("#entry-name").val().trim(),
            bsLevel: $("#entry-level").val().trim(),
            resultDate: $("#entry-date").val().trim(),
            insulinAmount: $("#entry-insulin").val().trim(),
            exerciseDuration: $("#entry-exercise-duration").val().trim(),
            exerciseIntensity: $("#entry-exercise-intensity").val().trim(),
            labels: $("#entry-labels").val().trim(),
            comments: $("#entry-comments").val().trim(),
            userId : this.model.get('id')
        };
    }

});