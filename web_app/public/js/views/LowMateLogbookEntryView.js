/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */
window.LowMateLogBookEntryView = Backbone.View.extend({
    
    tagName:  'tr',
    
    classNem : 'warning',
   
    initialize: function() {
    	this.template = _.template($('#logbookitem-template').html());    	
        _.bindAll(this);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});