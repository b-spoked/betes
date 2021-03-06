/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
var timelineToDate = new Date();
var timelineFromDate = new Date();
timelineFromDate.setDate(timelineToDate.getDate() - 2);


window.TimelineView = Backbone.View
		.extend({
			
			events : {
				"click #last-two" : "showThisTwo",
				"click #previous-two" : "showPreviousTwo",
				"click #all" : "showAll"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _
						.template($('#timeline-template').html());
				this.model.logEntries.bind('reset', this.render, this);
			},
			render : function() {

				$(this.el).html(this.template(this.model.toJSON()));

				_.defer(function(view) {
					view.showThisTwo();
				}, this);

				return this;
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			showAll : function() {
				this.showTimeline(null,null);
			},
			showThisTwo : function() {
				timelineToDate = new Date();
				timelineFromDate = new Date();
				timelineFromDate.setDate(timelineToDate.getDate() - 2);
				
				console.log("from: "+timelineFromDate);
				console.log("to: "+timelineToDate);
				
				this.showTimeline(timelineFromDate,timelineToDate);
			},
			showPreviousTwo : function() {
				timelineToDate.setDate(timelineFromDate.getDate());
				timelineFromDate.setDate(timelineToDate.getDate() - 2);
				
				console.log("from: "+timelineFromDate);
				console.log("to: "+timelineToDate);
				
				this.showTimeline(timelineFromDate,timelineToDate);
			},
			showTimeline : function(fromDate,toDate) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}
				
				document.getElementById("chart").innerHTML = "";
				document.getElementById("timeline").innerHTML = "";
				
				//Date dimension range
				var graph = new Rickshaw.Graph( {
					element: document.getElementById("chart"),
					width: 600,
					height: 150,
					renderer: 'scatterplot',
					interpolation: 'linear',
					series: [
						{
							color: 'black',
							data: this.getGlucoseData(fromDate,toDate),
							name: 'Glucose'
						},
						{
							color: 'red',
							data: this.getHighLine(fromDate,toDate),
							name: 'Upper Limit'
			              }, 
							{
								color:'green',
								data: this.getLowLine(fromDate,toDate),
								name: 'Lower Limit'
				              }
					]
				} );
				
				var annotator = new Rickshaw.Graph.Annotate( {
					graph: graph,
					element: document.getElementById("timeline")
				} );
				
				this.getGlucoseNotes(fromDate,toDate).forEach(function(note) {
					annotator.add(note.when, note.what);
				});
				
				var time = new Rickshaw.Fixtures.Time();
				var units;
				if(fromDate&&toDate){
					units = time.unit('6 hour');
				}else{
					units = time.unit('week');
				}

				var xAxis = new Rickshaw.Graph.Axis.Time({
				    graph: graph,
				    timeUnit: units
				});

				var yAxis = new Rickshaw.Graph.Axis.Y( {
					graph: graph,
					tickFormat: Rickshaw.Fixtures.Number.formatKMBT
				} );
				
				var hover = new Rickshaw.Graph.HoverDetail({
					graph:graph
				});
								
				graph.render();

			},
			getEpoch: function(dateString){
				
				var formatedDateString = moment(dateString).format("M/D/YY hh:mm"),
				myDate = new Date(formatedDateString);
				return Math.round(myDate.getTime()/1000.0);
			},
			getGlucoseData:function(fromDate,toDate){
				var glucose = new Array();
				var self = this;
				
				this.model.logEntries.filterGlucoseLevels(fromDate,toDate).forEach(function(entry) {
					var epoch = self.getEpoch(entry.get("resultDate"));
					var glucoseAmount = parseFloat(entry.get("glucoseLevel"));
					
					glucose.push({x:epoch,y:glucoseAmount});
				});
				
				return glucose.reverse();
			},
			getLowLine:function(fromDate,toDate){
				var low = new Array();
				var self = this;
				
				this.model.logEntries.filterGlucoseLevels(fromDate,toDate).forEach(function(entry) {
					var epoch = self.getEpoch(entry.get("resultDate"));
					low.push({x:epoch,y:4});
				});
				
				return low.reverse();
			},
			getHighLine:function(fromDate,toDate){
				var high = new Array();
				var self = this;
				
				this.model.logEntries.filterGlucoseLevels(fromDate,toDate).forEach(function(entry) {
					var epoch = self.getEpoch(entry.get("resultDate"));
					high.push({x:epoch,y:8});
				});
				
				return high.reverse();
				
			},
			getGlucoseNotes:function(fromDate,toDate){
				var notes = new Array();
				var self = this;
				
				this.model.logEntries.filterPeriod(fromDate,toDate).forEach(function(entry) {
					var epoch = self.getEpoch(entry.get("resultDate"));
					var note = "";
					if(entry.get("insulinAmount")){	
						note += entry.get("insulinAmount")+" u ";
					}else if(entry.get("exerciseDuration")){

						note +=  entry.get("exerciseDuration")+" mins ";
						note +=  "@ "+entry.get("exerciseIntensity");
					}
					if(entry.get("comments")){
						note += entry.get("comments");
					}
					if(note){
						notes.push({when:epoch,what:note});
					}
				});
				
				return notes.reverse();
			}
		});