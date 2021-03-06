/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */
window.Entry = Backbone.Model.extend({
	defaults : {
		name : '',
		bsLevel : 0,
		insulinAmount : 0,
		resultDate : new Date(),
		exerciseDuration : 0,
		exerciseIntensity : 'na',
		labels : '',
		comments : '',
		userId : 0
	},
	initialize : function() {
		this.checkGoals();
	},
	checkGoals : function() {
		this.set({
			goals : "goals-not-meet"
		});
	}
});

window.Entries = Backbone.Collection
		.extend({
			model : Entry,
			initialize : function() {
				this.storage = new Offline.Storage('logbook-entries', this, {
					autoPush : true
				});
			},

			goalPercentageForDay : function() {
				return .25;
			},
			filterDates : function(timeSpan) {
				if (timeSpan == 'today') {
					return this.filterToday();
				} else if (timeSpan == 'week') {

					return this.filterWeek();
				} else if (timeSpan == 'month') {

					return this.filterMonth();
				}

				return this.filterToday();
			},
			filterEntries : function(letters) {

				if (letters == "") {
					return this;
				}

				if (letters.indexOf('>') !== -1) {
					var valueOfReadings = letters.split('>');
					if (valueOfReadings[1]) {
						return this.filterGreaterThan(valueOfReadings[1]);
					}
				} else if (letters.indexOf('<') !== -1) {

					var valueOfReadings = letters.split('<');
					if (valueOfReadings[1]) {
						return this.filterLessThan(valueOfReadings[1]);
					}
				} else if (letters.indexOf('+') !== -1) {
					var included = letters.split('+');
					if (included) {
						//console.log(included);
						return this.filterPlus(included);
					}
				} else {
					return this.filterString(letters);
				}
				return this;
			},
			filterDays : function(numberOfDays) {
				
				var ONE_DAY = 1000 * 60 * 60 * 24;
				var now  = new Date().getTime(),
				daysInPast = 0;
				
				if(parseInt(numberOfDays) < 1){
					return;
				}else{
					if(parseInt(numberOfDays)>1){
						daysInPast = (parseInt(numberOfDays-1)*ONE_DAY);
					}
				}
				
				return _(this
						.filter(function(data) {
							var then = new Date(data.get('resultDate')).getTime();
							return (now-then) < daysInPast;
						}));
			},
			filterString : function(letters) {
				var pattern = new RegExp(letters, "gi");
				return _(this.filter(function(data) {
					return pattern.test(data.get("name"))
							|| pattern.test(data.get("labels"));
				}));
			},

			filterPlus : function(included) {

				var pattern1 = new RegExp(included[0].trim(), "gi");
				//console.log("pattern1 "+pattern1);
				var pattern2 = new RegExp(included[1].trim(), "gi");
				//console.log("pattern2 "+pattern2);
				return _(this.filter(function(data) {
					return pattern1.test(data.get("name"))
							|| pattern2.test(data.get("name"));
				}));
			},

			filterGreaterThan : function(level) {
				return _(this.filter(function(data) {
					return (parseInt(data.get("bsLevel")) > level);
				}));
			},
			filterLessThan : function(level) {
				return _(this.filter(function(data) {
					return (parseInt(data.get("bsLevel")) < level);
				}));

			},
			comparator : function(entry) {
				var date = new Date(entry.get('resultDate'));
				console.log("Entry Date: "+date);
			    return -date.getTime();
			}
		});