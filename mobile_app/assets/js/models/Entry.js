/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */
window.Entry = Backbone.Model.extend({
    defaults: {
        name: '',
        bsLevel: 0,
        insulinAmount: 0,
        resultDate: new Date(),
        exerciseDuration: 0,
        exerciseIntensity: 'na',
        labels: '',
        comments : '',
        userId : 0
    },
    urlRoot: "/api/index.php/user.json/logbook",
    initialize: function() {
        this.checkGoals();
    },
    checkGoals : function() {
        this.set({ goals: "goals-not-meet" });
    }
});

window.Entries = Backbone.Collection.extend({
    model : Entry,
    initialize : function() {
        this.storage = new Offline.Storage('logbook-entries', this, {
            autoPush:true
        });
    },

    goalPercentageForDay : function() {
        return .25;
    },
    filterDates:function(timeSpan) {
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

    filterToday: function() {
        var today = new Date();

        return _(this.filter(function(data) {
            var entryDate = new Date(data.get('resultDate'));

            return (entryDate.getDate() === today.getDate()
                && entryDate.getMonth() === today.getMonth()
                && entryDate.getFullYear() === today.getFullYear());
        }));
    },
    filterYesterday: function() {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return _(this.filter(function(data) {
            var entryDate = new Date(data.get('resultDate'));

            return (entryDate.getDate() === yesterday.getDate()
                && entryDate.getMonth() === yesterday.getMonth()
                && entryDate.getFullYear() === yesterday.getFullYear());
        }));
    },
    filterDays : function(numberOfDays) {

        var today = new Date();
        var endDate = new Date();
        endDate.setDate(endDate.getDate() - parseInt(numberOfDays));

        return _(this.filter(function(data) {
            var entryDate = new Date(data.get('resultDate'));

            var lessThan = (entryDate.getDate() >= endDate.getDate()
                && entryDate.getMonth() >= endDate.getMonth()
                && entryDate.getFullYear() >= endDate.getFullYear());

            var greaterThan = (entryDate.getDate() <= today.getDate()
                && entryDate.getMonth() <= today.getMonth()
                && entryDate.getFullYear() <= today.getFullYear());

            return (lessThan || greaterThan);
        }));
    },
    filterString : function(letters) {
        var pattern = new RegExp(letters, "gi");
        return _(this.filter(function(data) {
            return pattern.test(data.get("name")) || pattern.test(data.get("labels"));
        }));
    },

    filterPlus : function(included) {

        var pattern1 = new RegExp(included[0].trim(), "gi");
        //console.log("pattern1 "+pattern1);
        var pattern2 = new RegExp(included[1].trim(), "gi");
        //console.log("pattern2 "+pattern2);
        return _(this.filter(function(data) {
            return pattern1.test(data.get("name")) || pattern2.test(data.get("name"));
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
    comparator: function(entry) {
        //latest entry first
        var entryDate = new Date(entry.get('resultDate'));
        return -entryDate.getTime();
    }
});