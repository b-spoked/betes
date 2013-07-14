/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */
window.LogBookEntry = Backbone.Model.extend({
	
	defaults : {
		name: "",
        glucoseLevel: 0,
        resultDate: "",
        insulinAmount: 0,
        exerciseDuration: 0,
        exerciseIntensity: "",
        labels: "",
        comments: "",
        latitude: 0,
        longitude: 0,
        userId : ""
	}
});

window.LogBookEntries = Backbone.Collection.extend({
	model : LogBookEntry,
	initialize : function() {
		this.storage = new Offline.Storage('insights-logbook', this, {autoPush: true});
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

		if(fromDate&&toDate){
			return _(this.filter(function(data) {
				var recordDate = new Date(data.get('resultDate')).getTime();
				return (recordDate <= toDate && recordDate >= fromDate);
			}));
		}else{
			return this;
		}
	},
	filterString : function(letters) {
		var pattern = new RegExp(letters, "gi");
		return _(this.filter(function(data) {
			return pattern.test(data.get("labels"))
					|| pattern.test(data.get("comments"));
		}));
	},
	filterName : function(name) {
		var pattern = new RegExp(name, "gi");
		return _(this.filter(function(data) {
			return pattern.test(data.get("name"));
		}));
	},
	filterExerciseResults : function(){
		
		var getResultAfterExercise = false;
		return _(this.filter(function(data) {
			if(parseInt(data.get("exerciseDuration")) > 0){
				getResultAfterExercise = true;
				return (parseInt(data.get("exerciseDuration")) > 0);
			}else if(getResultAfterExercise){
				getResultAfterExercise = false;
				return true;
			}
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
			return (parseInt(data.get("glucoseLevel")) > level);
		}));
	},
	filterLessThan : function(level) {
		return _(this.filter(function(data) {
			return (parseInt(data.get("glucoseLevel")) < level);
		}));

	},
	filterGlucoseLevels : function(fromDate, toDate) {
		
		if(fromDate&&toDate){
			return _(this.filter(function(data) {
				
				var resultDate = new Date(data.get('resultDate')).getTime();
				var isInPeriod = (resultDate <= toDate && resultDate >= fromDate);
				
				return (isInPeriod && parseInt(data.get("glucoseLevel")) > 0);
			}));
		}else{
		
			return _(this.filter(function(data) {
				return (parseInt(data.get("glucoseLevel")) > 0);
			}));
		}
	},
	filterInsulin : function() {
		return _(this.filter(function(data) {
			return (parseInt(data.get("glucoseLevel")) > 0);
		}));
	},
	filterExcercise : function() {
		return _(this.filter(function(data) {
			return (parseInt(data.get("exerciseDuration")) > 0);
		}));
	},
	filterHypos : function() {
		var hypoPattern = new RegExp('hypo', "gi");
		var lowPattern = new RegExp('low', "gi");
		return _(this.filter(function(data) {
			return lowPattern.test(data.get("labels"))
			|| hypoPattern.test(data.get("labels"));
		}));

	},
	comparator : function(entry) {
		var date = new Date(entry.get('resultDate'));
		return -date.getTime();
	}
});