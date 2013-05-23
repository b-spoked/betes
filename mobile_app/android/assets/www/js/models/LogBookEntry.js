/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */
window.LogBookEntry = Backbone.Model.extend({

});

window.LogBookEntries = Backbone.Collection.extend({
	model : LogBookEntry,
	initialize : function() {
		this.storage = new Offline.Storage('insights-logbook', this);
	},
	fetch : function(options) {
		this.trigger('fetch', this, options);
		return Backbone.Collection.prototype.fetch.call(this, options);
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
		var now = new Date().getTime(), daysInPast = 0;

		if (parseInt(numberOfDays) < 1) {
			return;
		} else {
			if (parseInt(numberOfDays) > 1) {
				daysInPast = (parseInt(numberOfDays - 1) * ONE_DAY);
			}
		}

		return _(this.filter(function(data) {
			var then = new Date(data.get('resultDate')).getTime();
			return (now - then) < daysInPast;
		}));
	},
	filterPeriod : function(fromDate, toDate) {

		return _(this.filter(function(data) {
			var recordDate = new Date(data.get('resultDate')).getTime();
			return (recordDate <= toDate && recordDate >= fromDate);
		}));
	},
	filterString : function(letters) {
		var pattern = new RegExp(letters, "gi");
		return _(this.filter(function(data) {
			return pattern.test(data.get("labels"))
					|| pattern.test(data.get("comments"));
		}));
	},
	filterPlus : function(included) {

		var pattern1 = new RegExp(included[0].trim(), "gi");
		//console.log("pattern1 "+pattern1);
		var pattern2 = new RegExp(included[1].trim(), "gi");
		//console.log("pattern2 "+pattern2);
		return _(this.filter(function(data) {
			return pattern1.test(data.get("labels"))
					|| pattern2.test(data.get("comments"));
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
		return -date.getTime();
	}
});