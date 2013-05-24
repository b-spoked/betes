/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */
window.HypoEntryView = Backbone.View.extend({
    
    tagName:  'tr',

    initialize: function() {
    	this.template = _.template($('#hypoitem-template').html());
    	
        _.bindAll(this);
        this.model.bind("destroy", this.close, this);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});