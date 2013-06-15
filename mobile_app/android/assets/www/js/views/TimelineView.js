/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.TimelineView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange",
				"change #show-filter" : "changeFilter"
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
					view.showTimeline();
				}, this);

				return this;
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			showTimeline : function() {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}
			
				//Date dimension range
				var graph = new Rickshaw.Graph( {
					element: document.getElementById("chart"),
					width: 320,
					height: 240,
					renderer: 'area',
					stroke: true,
					preserve: true,
					series: [
						{
							color: palette.color(),
							data: this.getGlucoseData(),
							name: 'Glucose'
						}, {
							color: palette.color(),
							data: this.getInsulinData(),
							name: 'Insulin'
						}, {
							color: palette.color(),
							data: this.getExerciseData(),
							name: 'Excercise'
						}
					]
				} );
				
				graph.render();

				var slider = new Rickshaw.Graph.RangeSlider( {
					graph: graph,
					element: $('#slider')
				} );

				var hoverDetail = new Rickshaw.Graph.HoverDetail( {
					graph: graph
				} );

				var annotator = new Rickshaw.Graph.Annotate( {
					graph: graph,
					element: document.getElementById('timeline')
				} );

				var legend = new Rickshaw.Graph.Legend( {
					graph: graph,
					element: document.getElementById('legend')

				} );

				var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
					graph: graph,
					legend: legend
				} );

				var order = new Rickshaw.Graph.Behavior.Series.Order( {
					graph: graph,
					legend: legend
				} );

				var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
					graph: graph,
					legend: legend
				} );
				
				var xAxis = new Rickshaw.Graph.Axis.Time( {
					graph: graph,
					ticksTreatment: ticksTreatment
				} );

				xAxis.render();

				var yAxis = new Rickshaw.Graph.Axis.Y( {
					graph: graph,
					tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
					ticksTreatment: ticksTreatment
				} );

				yAxis.render();

			},
			getGlucoseData:function(){
				var glucose = new Array();
				
				view.model.logEntries.filterGlucoseLevels().forEach(function(entry) {
					glucose.push({x:new Date(entry.get("resultDate")),y:parseFloat(entry.get("glucoseLevel"))});
				});
				
				return glucose;
			},
			getInsulinData:function(){
				var insulin = new Array();
				
				view.model.logEntries.filterInsulin().forEach(function(entry) {
					insulin.push({x:new Date(entry.get("resultDate")),y:parseFloat(entry.get("insulinAmount"))});
				});
				
				return insulin;
			},
			getExerciseData:function(){
				var exercise = new Array();
				
				view.model.logEntries.filterExcercise().forEach(function(entry) {
					exercise.push({x:new Date(entry.get("resultDate")),y:parseFloat(entry.get("exerciseDuration"))});
				});
				
				return exercise;
			}
		});