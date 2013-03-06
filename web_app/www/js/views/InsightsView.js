/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.InsightsView = Backbone.View
		.extend({

			events : {
				'click .show-today' : 'filterToday',
				'click .show-yesterday' : 'filterYesterday',
				'click .show-seven' : 'filterSeven'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#insights-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			},
			refresh : function() {
				this.model.logEntries.fetch();
				this.render();
			},
			filterToday : function() {
				this.showInsights(this.model.logEntries.filterToday());
			},
			filterYesterday : function() {
				this.showInsights(this.model.logEntries.filterYesterday());
			},
			filterSeven : function() {
				this.showInsights(this.model.logEntries.filterDays('7'));
			},
			showInsights : function(entries) {

				if (entries) {
					data = new Array();
					entries.forEach(function(entry) {
						if ((entry.get("bsLevel") != "")
								&& (entry.get("bsLevel") > 0)) {
							data.push(entry.toJSON());
						}
					});
				}

			}
		});