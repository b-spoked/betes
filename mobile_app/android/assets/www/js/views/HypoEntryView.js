/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */

var viewHelper = {
    formatDate: function(dateToFormat) {
    	var dateFormat = d3.time.format("%d/%b %I:%M %p");
    	return dateFormat(new Date(dateToFormat));
    }
};
window.HypoEntryView = Backbone.View.extend({
    
    tagName:  'tr',

    initialize: function() {
    	this.template = _.template($('#hypoitem-template').html());
    	
        _.bindAll(this);
        this.model.bind("destroy", this.close, this);
    },
    render: function() {
    	var data = this.model.toJSON();
        _.extend(data, viewHelper);
        var html = this.template(data);
        $(this.el).append(html);
        return this;
    }
});