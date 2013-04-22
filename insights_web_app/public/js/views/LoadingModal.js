/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:53 PM
 * To change this template use File | Settings | File Templates.
 */
window.LoadingModal = Backbone.View.extend({
	
    initialize: function() {
		_.bindAll(this);
    	this.template = _.template($('#loading-template').html());
    },
    render: function() {
    	 $(this.el).html(this.template());
    	 return this;
    },
    showDialog:function() {
        $("#loading-dialog").modal('show');
    },
    hideDialog:function() {
        $("#loading-dialog").modal('hide');
    }
});