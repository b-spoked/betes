/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:49 PM
 * To change this template use File | Settings | File Templates.
 */
//Edit record modal view
window.EditLogbookEntryView = Backbone.View.extend({
    editEntryTemplate: _.template($('#edit-item-template').html()),

    events: {
        'click .save-edit': 'saveEdits'
    },

    render: function() {
        $(this.el).html(this.editEntryTemplate(this.model.toJSON()));
        return this;
    },

    showDialog: function() {
        $("#edit-entry").modal('show');
    },

    saveEdits:function(e) {
        this.model.save(this.editedEntryValues());
        $("#edit-entry").modal('hide');
    },

    editedEntryValues: function() {
        return {
            name: $("#edit-entry-name").val().trim(),
            bsLevel: $("#edit-entry-level").val().trim(),
            resultDate: $("#edit-entry-date").val().trim(),
            insulinAmount: $("#edit-entry-insulin").val().trim(),
            exerciseDuration: $("#edit-entry-exercise-duration").val().trim(),
            exerciseIntensity: $("#edit-entry-exercise-intensity").val().trim(),
            labels: $("#edit-entry-labels").val().trim(),
            comments: $("#edit-entry-comments").val().trim()
        };
    }
});