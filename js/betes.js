var app = app || {};

$(function($) {

    var Entry = Backbone.Model.extend({
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

    var Entries = Backbone.Collection.extend({
        model : Entry,
        initialize : function() {
            this.storage = new Offline.Storage('logbook-entries', this, {
                autoPush:true
            });
        },

        goalPercentageForDay : function() {
            return .25;
        },
        filterDates:function(timeSpan){
            if(timeSpan=='today'){
                return this.filterToday();
            }else if(timeSpan=='week'){
                
                return this.filterWeek();
            }else if(timeSpan=='month'){
                
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
            var today=new Date();
            
           return _(this.filter(function(data) {
                var entryDate = new Date(data.get('resultDate'));
                
                return (entryDate.getDate() === today.getDate()
                    && entryDate.getMonth() === today.getMonth()
                    && entryDate.getFullYear() === today.getFullYear());
            }));
        },
        filterYesterday: function() {
            var yesterday=new Date();
            yesterday.setDate(yesterday.getDate()-1);
            
           return _(this.filter(function(data) {
                var entryDate = new Date(data.get('resultDate'));
                
                return (entryDate.getDate() === yesterday.getDate()
                    && entryDate.getMonth() === yesterday.getMonth()
                    && entryDate.getFullYear() === yesterday.getFullYear());
            }));
        },
        filterDays : function(numberOfDays) {
            
            var today=new Date();
            var endDate=new Date();
            endDate.setDate(endDate.getDate()-parseInt(numberOfDays));
            
            return _(this.filter(function(data) {
                var entryDate = new Date(data.get('resultDate'));
                
                var lessThan = (entryDate.getDate() >= endDate.getDate()
                    && entryDate.getMonth() >= endDate.getMonth()
                    && entryDate.getFullYear() >= endDate.getFullYear());
                
                 var greaterThan = (entryDate.getDate() <= today.getDate()
                    && entryDate.getMonth() <= today.getMonth()
                    && entryDate.getFullYear() <= today.getFullYear());
            
                return (lessThan||greaterThan);
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

    var Goals = Backbone.Model.extend({
        defaults: {
            bsLowerRange: '',
            bsUpperRange: '',
            bsFrequency: '',
            exerciseDuration: '',
            exerciseFrequency: '',
            longTermGoal:'',
            longTermGoalDate:''
        }
    });

    var GoalSet = Backbone.Collection.extend({
        model : Goals,
        initialize : function() {
            this.storage = new Offline.Storage('user-goals', this, {
                autoPush:true
            });
        }
    });

    var User = Backbone.Model.extend({
        defaults: {
            name: '',
            email: 'na',
            newsletter: false,
            thumbnailPath: '',
            authenticated : false,
            testingUnits : 'mmol/l',
            logEntries :[],
            userGoals:[]
        },

        urlRoot: "/api/index.php/user.json",

        initialize: function() {

            var self = this;
            this.logEntries = new Entries(this.get('logEntries'));
            this.userGoals = new GoalSet(this.get('userGoals'));

            this.logEntries.url = function () {
                return self.urlRoot + '/logbook/' + self.get('id');
            };

            this.userGoals.url = function () {
                return self.urlRoot + '/goals/' + self.get('id');
            };

        }
    });

    var UserDetails = Backbone.Collection.extend({
        model : User,
        initialize : function() {
            this.storage = new Offline.Storage('logbook-user', this, {
                autoPush:true
            });
        },
        url:'/api/index.php/user.json'
    });

    //Edit record modal view
    app.EditEntryView = Backbone.View.extend({
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
    //Single log book entry
    app.LogBookEntryView = Backbone.View.extend({

        //... is a list tag.
        tagName:  'tr',

        className: 'success',

        rowTemplate: _.template($('#item-template').html()),

        events: {
            'click .update': 'editEntry',
            'click .delete': 'deleteEntry'
        },
        initialize: function() {
            _.bindAll(this);
            this.model.on('change', this.render, this);
        },
        render: function() {
            this.$el.html(this.rowTemplate(this.model.toJSON()));
            return this;
        },
        editEntry: function(e) {
            var view = new app.EditEntryView({model:this.model});
            view.render();

            var $modalEl = $("#modal-dialog");
            $modalEl.html(view.el);
            view.showDialog();
        },
        deleteEntry: function() {
            this.model.destroy();
        }
    });
    //About this app
    app.AboutView = Backbone.View.extend({
        aboutTemplate: _.template($('#about-template').html()),

        initialize: function() {
            _.bindAll(this);
            $(this.el).html(this.aboutTemplate());
        },

        render: function() {
            $(this.el).hide();
        },
        close: function() {
            this.remove();
            this.unbind();
        },
        onShow: function() {
            $(this.el).show(500);
        }
    });
    app.GoalSetView = Backbone.View.extend({

        //... is a list tag.
        tagName:  'tr',

        rowTemplate: _.template($('#goal-template').html()),

        events: {
            'click .update-goals': 'updateGoals',
            'click .delete-goals': 'deleteGoals'
        },
        initialize: function() {
            _.bindAll(this);
            this.model.on('change', this.render, this);
        },
        render: function() {
            this.$el.html(this.rowTemplate(this.model.toJSON()));
            return this;
        },
        updateGoals: function(e) {
            var view = new app.EditGoalsView({model:this.model});
            view.render();

            var $modalEl = $("#modal-dialog");
            $modalEl.html(view.el);
            view.showDialog();
        },
        deleteGoals: function() {
            this.model.destroy();
        }
    });
    //Users account
    app.AccountView = Backbone.View.extend({
        accountTemplate: _.template($('#account-template').html()),

        events: {
            'click #save-profile': 'saveProfile',
            'click .add-new-goals': 'showAddGoalsDialog'
        },
        initialize: function() {
            $(this.el).html(this.accountTemplate(this.model.toJSON()));

            _.bindAll(this);
            app.User.userGoals.bind('add', this.addOne, this);
            app.User.userGoals.bind('reset', this.addAll, this);
            app.User.userGoals.bind('remove', this.refresh, this);
            app.User.userGoals.fetch();
        },
        render: function() {

            $(this.el).hide();
        },
        close: function() {
            this.remove();
            this.unbind();
        },
        onShow: function() {
            $("#profile-saved-message").hide();
            $('#user-tabs a:first').tab('show');
            $(this.el).show(500);
        },
        refresh: function() {
            app.User.userGoals.fetch();
            this.render();
            this.onShow();
        },
        addOne: function(goal) {
            var goalSetView = new app.GoalSetView({
                model: goal
            });
            this.$('#goals-list').append(goalSetView.render().el);
        },
        addAll: function(goals) {
            if (goals == null) {
                goals = app.User.userGoals.fetch();
            }
            if(goals != null){
                this.$('#goals-list').html('');
                goals.each(this.addOne, this);
            }
        },
        userProfileValues: function() {
            return {
                name: $("#account-user-name").val().trim(),
                email: $("#account-user-email").val().trim(),
                pw: $("#account-user-pw").val().trim(),
                testingUnits: $("#account-testing-units").val().trim()
            };
        },
        saveProfile : function(e) {
            e.preventDefault();
            this.model.set(this.userProfileValues());
            this.model.save();
            $("#profile-saved-message").show();
        },
        showAddGoalsDialog : function(e) {
            var goalSetDialog = new app.AddGoalSetView();
            goalSetDialog.render();

            var $modalEl = $("#modal-goal");
            $modalEl.html(goalSetDialog.el);
            goalSetDialog.showDialog();
        }

    });

    //Add goalset
    app.AddGoalSetView = Backbone.View.extend({
        addGoalsTemplate: _.template($('#add-goal-template').html()),

        events: {
            'click .add-goal': 'saveNewGoals'
        },

        render: function() {
            $(this.el).html(this.addGoalsTemplate());
            return this;
        },

        showDialog: function() {
            $("#add-goal-dialog").modal('show');
        },
        saveNewGoals:function() {

            app.User.userGoals.create(this.newGoalValues());
            $("#add-goal-dialog").modal('hide');
        },

        newGoalValues: function() {
            return {
                bsLowerRange: $("#goal-bs-lower").val().trim(),
                bsUpperRange: $("#goal-bs-upper").val().trim(),
                bsFrequency: $("#goal-bs-frequency").val().trim(),
                exerciseDuration: $("#goal-exercise-duration").val().trim(),
                exerciseFrequency: $("#goal-exercise-frequency").val().trim(),
                longTermGoal: $("#goal-long-term").val().trim(),
                longTermGoalDate: $("#goal-long-term-date").val().trim()
            };
        }

    });
    //Add record modal view
    app.AddEntryView = Backbone.View.extend({
        addEntryTemplate: _.template($('#add-item-template').html()),
    
        events: {
            'click .add-entry': 'saveNewEntry'
        },

        render: function() {
            $(this.el).html(this.addEntryTemplate());
            return this;
        },

        showDialog: function() {
            var local = new Date();
            var date = new Date();
            local.setHours(date.getHours() + (date.getTimezoneOffset() / -60));
            $('#entry-date').val(local.toJSON().substring(0, 19).replace('T', ' '));
            $("#add-entry-dialog").modal('show');
        },
        saveNewEntry:function() {
            logEntry = new Entry(this.entryValues());
            logEntry.save();
            app.User.logEntries.create(logEntry, {local:true});
            $("#add-entry-dialog").modal('hide');
        },

        entryValues: function() {
            return {
                name: $("#entry-name").val().trim(),
                bsLevel: $("#entry-level").val().trim(),
                resultDate: $("#entry-date").val().trim(),
                insulinAmount: $("#entry-insulin").val().trim(),
                exerciseDuration: $("#entry-exercise-duration").val().trim(),
                exerciseIntensity: $("#entry-exercise-intensity").val().trim(),
                labels: $("#entry-labels").val().trim(),
                comments: $("#entry-comments").val().trim(),
                userId : app.User.get('id')
            };
        }

    });
    //The fill log book
    app.LogBookView = Backbone.View.extend({
        logBookTemplate: _.template($('#logbook-template').html()),

        events: {
            'click #create-new-entry': 'showEventDialog',
            'click #show-today': 'filterToday',
            'click #show-yesterday': 'filterYesterday',
            'click #show-seven': 'filterSeven',
            'click #show-thirty': 'filterThirty',
            "keyup #filter-logbook" : "filterLogBook",
            "keyup #filter-bs-graph" : "filterBloodSugarGraph",
            'keyup #filter-bs-vs-exercise-graph': "filterBloodSugarVsExerciseGraph",
            'keyup #filter-goals-graph': "filterGoalsGraph",
            'shown a[data-toggle="tab"]': "showGraph"
        },

        initialize: function() {
            $('#filter-logbook-popover').popover('toggle');
            $(this.el).html(this.logBookTemplate());
            _.bindAll(this);
            app.User.logEntries.bind('add', this.addOne, this);
            app.User.logEntries.bind('reset', this.addAll, this);
            app.User.logEntries.bind('remove', this.refresh, this);
            app.User.logEntries.fetch();
        },
        render: function() {
            $(this.el).hide();
        },
        close: function() {
            this.remove();
            this.unbind();
        },
        onShow: function() {
            $(this.el).show(500);
        },
        refresh: function() {
            app.User.logEntries.fetch();
            this.render();
            this.onShow();
        },
        showGraph :function(e) {
            if (e.target.hash == "#bs-graph") {
                this.showBloodSugarGraph(app.User.logEntries);
            } else if (e.target.hash == "#bs-vs-exercise-graph") {
                this.showBloodSugarVsexerciseGraph(app.User.logEntries);
            } else if (e.target.hash == "#goals-graph") {
                this.showGoalsGraph(app.User.logEntries);
            }
        },
        addOne: function(entry) {
            var view = new app.LogBookEntryView({
                model: entry
            });
            this.$('#events-list').append(view.render().el);
        },
        addAll: function(entries) {
            if (entries == null) {
                entries = app.User.logEntries.fetch();
            }
            if(entries != null){
                this.$('#events-list').html('');
                entries.each(this.addOne, this);
            }
        },
        showEventDialog: function() {
            var view = new app.AddEntryView();
            view.render();

            var $modalEl = $("#modal-dialog");
            $modalEl.html(view.el);
            view.showDialog();
        },
        filterToday:function(){;
             this.addAll(app.User.logEntries.filterToday());
        },
        filterYesterday:function(){
            this.addAll(app.User.logEntries.filterYesterday());
        },
        filterSeven:function(){
            this.addAll(app.User.logEntries.filterDays('7'));
        },
        filterThirty:function(){
            this.addAll(app.User.logEntries.filterDays('30'));
        },
        filterLogBook: function(e) {
            var searchString = $("#filter-logbook").val();
            this.addAll(app.User.logEntries.filterEntries(searchString));
        },
        filterBloodSugarGraph: function(e) {
            var searchString = $("#filter-bs-graph").val();

            this.showBloodSugarGraph(app.User.logEntries.filterEntries(searchString));
        },
        filterBloodSugarVsExerciseGraph: function(e) {
            var searchString = $("#filter-bs-vs-exercise-graph").val();
            this.filterBloodSugarVsExerciseGraph(app.User.logEntries.filterEntries(searchString));
        },
        showBloodSugarGraph : function(entries) {

            var data = null;
            var color = d3.scale.category10();

            if (entries) {
                data = new Array();
                entries.forEach(function(entry) {
                    if((entry.get("bsLevel") != "") && (entry.get("bsLevel") > 0)) {
                        data.push(entry.toJSON());
                    }
                });
            }

            var margin = {top: 10, right: 20, bottom: 20, left: 30},
                width = 430;// - margin.left - margin.right,
            height = 290;// - margin.top - margin.bottom;

            var x = d3.time.scale()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            //average
            var averagedData = this.getAverageResults(data);
            var averagedLine = d3.svg.line()
                .x(function(entry) {
                    return x(entry.resultDate);
                })
                .y(function(entry) {
                    return y(entry.average);
                });

            $("#bs-results").html('');

            var svg = d3.select("#bs-results").append("svg")
                .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            data.forEach(function(entry) {
                entry.resultDate = new Date(entry.resultDate);
                //console.log(entry.when);
                entry.bsLevel = +entry.bsLevel;
            });

            x.domain(d3.extent(data, function(entry) {
                return entry.resultDate;
            }));
            y.domain(d3.extent(data, function(entry) {
                return entry.bsLevel;
            }));

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(10," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("y", -10)
                .attr("dy", ".75em")
                .style("text-anchor", "middle")
                .text("Reading Date")

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".75em")
                .style("text-anchor", "end")
                .text("Reading (mmol)");

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 2)
                .attr("cx", function(d) {
                    return x(d.resultDate);
                })
                .attr("cy", function(d) {
                    return y(d.bsLevel);
                })
                .style("fill", function(d) {
                    return color(d.name);
                });

            /*Average blood sugar */
            svg.append("path")
                .datum(averagedData)
                .attr("class", "line")
                .attr("d", averagedLine);

            /*Legend */
            var legend = svg.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 5)
                .attr("width", 5)
                .attr("height", 5)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 13)
                .attr("y", 3)
                .attr("dy", ".25em")
                .style("text-anchor", "end")
                .text(function(d) {
                    return d;
                });
        },
        getAverageResults : function(data) {

            var averaged = new Array(),
                averageReading = null,
                sumOfReadings = 0,
                numberOfReadings = 0;

            if (data) {

                data.forEach(function(entry) {
                    if (entry.bsLevel) {
                        numberOfReadings ++;
                        sumOfReadings += parseInt(entry.bsLevel);
                    }
                });

                averageReading = sumOfReadings / numberOfReadings;

                data.forEach(function(entry) {
                    if (entry.bsLevel) {
                        var point = {resultDate:new Date(entry.resultDate),average:averageReading};
                        averaged.push(point);
                    }
                });
            }
            return averaged;
        },
        filterBloodSugarVsExerciseGraph : function(entries) {

            var data = null;
            var color = d3.scale.category10();


            if (entries) {
                data = new Array();
                entries.forEach(function(entry) {
                    data.push(entry.toJSON());
                });
            }

            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.time.scale()
                .range([0, width]);
            //blood sugars
            var y = d3.scale.linear().range([height, 0]);
            //exercise
            var y2 = d3.scale.linear().range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxisLeft = d3.svg.axis()
                .scale(y)
                .orient("left");

            var yAxisRight = d3.svg.axis()
                .scale(y2)
                .orient("right");

            var line = d3.svg.line()
                .x(function(entry) {
                    return x(entry.resultDate);
                })
                .y(function(entry) {
                    return y(entry.bsLevel);
                });

            var line2 = d3.svg.line()
                .x(function(entry) {
                    return x(entry.resultDate);
                })
                .y(function(entry) {
                    return y2(entry.exerciseDuration);
                });

            $("#bs-vs-exercise").html('');

            var svg = d3.select("#bs-vs-exercise").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            data.forEach(function(entry) {
                entry.resultDate = new Date(entry.resultDate);
                entry.bsLevel = +entry.bsLevel;
                entry.exerciseDuration = entry.exerciseDuration;
            });

            x.domain(d3.extent(data, function(entry) {
                return entry.resultDate;
            }));
            y.domain(d3.extent(data, function(entry) {
                return entry.bsLevel;
            }));
            y2.domain(d3.extent(data, function(entry) {
                return entry.exerciseDuration;
            }));

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxisLeft)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .text("Reading (mmol)");

            svg.append("g")
                .attr("class", "y axis axisRight")
                .call(yAxisRight)
                .attr("transform", "translate(" + (width - 10) + ",0)")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .text("exercise (mins)");

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function(d) {
                    return x(d.resultDate);
                })
                .attr("cy", function(d) {
                    return y(d.bsLevel);
                })
                .style("fill", function(d) {
                    return color(d.exerciseDuration);
                });

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function(d) {
                    return x(d.resultDate);
                })
                .attr("cy", function(d) {
                    return y(d.exerciseDuration);
                })
                .style("fill", function(d) {
                    return color(d.exerciseDuration);
                });

        },
        showGoalsGraph : function(entries) {

            var data = null;

            if (entries) {
                data = new Array();
                entries.forEach(function(entry) {
                    data.push(entry.toJSON());
                });
            }

            var margin = {top: 5, right: 20, bottom: 5, left: 5},
                width = 455;// - margin.left - margin.right,
            height = 100;// - margin.top - margin.bottom,
            cellSize = 8; // cell size

            var day = d3.time.format("%w"),
                week = d3.time.format("%U"),
                percent = d3.format(".1%"),
                format = d3.time.format("%Y-%m-%d");

            var color = d3.scale.quantize()
                .domain([-.05, .05])
                .range(d3.range(11).map(function(d) {
                return "q" + d + "-11";
            }));

            var svg = d3.select("#goals").selectAll("svg")
                .data(d3.range(2013, 2014))
                .enter().append("svg")
                .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
                .attr("class", "RdYlGn")
                .append("g")
                .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

            svg.append("text")
                .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                .style("text-anchor", "middle")
                .text(function(d) {
                    return d;
                });

            var rect = svg.selectAll(".day")
                .data(function(d) {
                    return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("rect")
                .attr("class", "day")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function(d) {
                    return week(d) * cellSize;
                })
                .attr("y", function(d) {
                    return day(d) * cellSize;
                })
                .datum(format);

            rect.append("title")
                .text(function(d) {
                    return d;
                });

            svg.selectAll(".month")
                .data(function(d) {
                    return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("path")
                .attr("class", "month")
                .attr("d", monthPath);

            //data

            //roll up goals for the day
            var goalsData = d3.nest()
                .key(function(d) {
                    return format(new Date(d.resultDate));
                })
                .rollup(function(d) {
                    return .4;
                })
                .map(data);


            rect.filter(function(d) {
                return d in goalsData;
            })
                .attr("class", function(d) {
                    return "day " + color(goalsData[d]);
                })
                .select("title")
                .text(function(d) {
                    return d + ": " + percent(goalsData[d]);
                });

            function monthPath(t0) {
                var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                    d0 = +day(t0), w0 = +week(t0),
                    d1 = +day(t1), w1 = +week(t1);
                return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                    + "H" + w0 * cellSize + "V" + 7 * cellSize
                    + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                    + "H" + (w1 + 1) * cellSize + "V" + 0
                    + "H" + (w0 + 1) * cellSize + "Z";
            }

        },
        filterGoalsGraph: function(e) {
            var searchString = $("#filter-goals-graph").val();
            this.showGoalsGraph(e, app.User.logEntries.filterEntries(searchString));
        },

        shareGraph : function(e) {
            var graphCanvas = document.getElementById("mycanvas");
            var graphImg = graphCanvas.toDataURL("image/png");
        }
    });

    //Login
    app.LoginView = Backbone.View.extend({

        loginTemplate: _.template($('#login-template').html()),

        events: {
            'click #login-fb': 'loginWithFB',
            'click #login-google': 'loginWithGoogle'
        },

        initialize: function() {
            _.bindAll(this);
            app.User.on('change:authenticated', this.setUserSaveStatus, this);
        },
        render: function() {
            $(this.el).html(this.loginTemplate());
        },
        showDialog:function() {
            $("#login-dialog").modal('show');
        },
        setUserSaveStatus:function() {
            if (app.User.get('authenticated')) {
                this.setServerSave();
                return;
            }
            this.setLocalSave();
        },
        loginWithFB: function() {
            _.extend(Backbone.OAuth.configs.Facebook, {

                onSuccess: function(params) {
                    console.log('FB ' + params.access_token);

                    // Get the user's data from Facebook's graph api.
                    $.ajax('https://graph.facebook.com/me?access_token=' + params.access_token, {
                        success: function(data) {
                            app.Users = new UserDetails();
                            app.Users.fetch({local:true});

                            app.User = app.Users.first();

                            if (!app.User || (app.User.get("id") != data.id)) {
                                console.log('3rd party id: ' + data.id);
                                app.User = new User({
                                    id:data.id,
                                    name:data.name,
                                    email:data.email,
                                    thumbnailPath:data.picture,
                                    authenticated:true
                                });

                                app.User.fetch();
                                app.User.save();

                                app.Users.reset();
                                app.Users.create(app.User, {local:true});

                            }
                        }
                    });

                }
            });
            // Create a new OAuth object and call the auth() method to start the process.
            var FBAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Facebook);
            FBAuthorisation.auth();
            $("#login-dialog").modal('hide');
        },
        loginWithGoogle: function() {
            _.extend(Backbone.OAuth.configs.Google, {

                onSuccess: function(params) {
                    console.log('Google: ' + params.access_token);

                    // Get the user's data from the Google api.
                    $.ajax('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + params.access_token, {
                        success: function(data) {
                            app.Users = new UserDetails();
                            app.Users.fetch({local:true});

                            app.User = app.Users.first();

                            if (!app.User || (app.User.get("id") != data.id)) {
                                console.log('3rd party id: ' + data.id);
                                app.User = new User({
                                    id:data.id,
                                    name:data.name,
                                    email:data.email,
                                    thumbnailPath:data.picture,
                                    authenticated:true
                                });

                                app.User.fetch();
                                app.User.save();

                                app.Users.reset();
                                app.Users.create(app.User, {local:true});

                            }

                        }
                    });
                }
            });
            // Create a new OAuth object and call the auth() method to start the process.
            var GoogleAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Google);
            GoogleAuthorisation.auth();
            $("#login-dialog").modal('hide');
        },

        setLocalSave:function() {
            console.log('save local only');
            Offline.onLine = function() {
                return false;
            };
        },

        setServerSave:function() {

            console.log('save to server if online');
            Offline.onLine = function() {
                return navigator.onLine !== false;
            };
        }
    });
    //Navigation View
    app.NavView = Backbone.View.extend({

        el: "#app-nav",

        events: {
            'click #login': 'showLoginDialog'
        },

        navigationTemplate: _.template($('#nav-template').html()),

        initialize: function() {
            this.getCurrentUser();
            _.bindAll(this, "render");
            app.User.bind('change:authenticated', this.render, this);
            this.render();
        },
        render: function() {
            $(this.el).html(this.navigationTemplate(app.User.toJSON()));
            return this;
        },

        showLoginDialog:  function(e) {
            var loginDialog = new app.LoginView();
            loginDialog.render();
            var $modalEl = $("#modal-dialog");
            $modalEl.html(loginDialog.el);
            loginDialog.showDialog();
        },
        getCurrentUser:function() {
            var user,
                users;

            app.Users = new UserDetails();

            app.Users.fetch({local: true});
            app.User = app.Users.first();

            if (!app.User) {
                app.Users.add(new User());
                app.User = app.Users.first();
            } else if ((app.User.get('id') > 0) && (app.User.get('authenticated'))) {
                app.Users.storage.sync.push();

            }

        }

    });

    var ApplicationRouter = Backbone.Router.extend({

        navigationView : null,

        routes: {
            "":"showLogBook",
            "account" : "showAccount",
            "about" : "showAbout"
        },

        initialize: function() {
            this.navigationView = new app.NavView();
        },

        showLogBook: function() {
            this.setActiveNav("#log-page");
            RegionManager.show(new app.LogBookView());
        },
        showAccount: function() {
            this.setActiveNav("#settings-page");
            RegionManager.show(new app.AccountView({model:app.User}));
        },
        showAbout: function() {
            this.setActiveNav("#about-page");
            RegionManager.show(new app.AboutView());
        },
        setActiveNav:function(activeId) {
            $(activeId).parent().parent().find('.active').removeClass('active');
            $(activeId).addClass('active');
        }
    });

    RegionManager = (function (Backbone, $) {
        var currentView;
        var el = "#main";
        var region = {};

        var closeView = function (view) {
            if (view && view.close) {
                view.close();
            }
        };
        var openView = function (view) {
            view.render();
            $(el).html(view.el);
            if (view.onShow) {
                view.onShow();
            }
        };
        region.show = function (view) {
            closeView(currentView);
            currentView = view;
            openView(currentView);
        };
        return region;
    })(Backbone, jQuery);

    AppRouter = new ApplicationRouter();
    Backbone.history.start();
});