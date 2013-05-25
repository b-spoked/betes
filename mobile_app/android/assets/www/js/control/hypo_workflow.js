var timer = null;

window.hypoWorkflow = {

	startHypoProcess : function(model) {
		var loc = this.getLocation();
		model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'hypo recorded',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		});
		this.startRetestTimer(model);
		this.alertContacts(model);
		this.remindProcess();
	},

	endHypoProcess : function(model) {
		var loc = this.getLocation();
		model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'Hypo treated',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		});
		this.alertContactsOK(model);
		jQuery("#retest-reminder").hide();
		jQuery("#process-detail").hide();
		clearInterval(timer);
	},

	trackLocation : function() {
		alert('start tracking location');
	},

	alertContacts : function(model) {

		var loc = this.getLocation();

		model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'Alerting contacts that your having a hypo',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		});
	},

	alertContactsOK : function(model) {
		var loc = this.getLocation();
		model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'Alerting contacts that your OK',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		}); //
	},

	remindRetest : function(model) {
		var loc = this.getLocation();
		app.appUser.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'Time has past now retest',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		});
		jQuery("#retest-reminder").show();
		navigator.notification.vibrate(2);
	},

	remindProcess : function() {
		jQuery("#process-detail").show();
	},

	startRetestTimer : function(model) {
		var loc = this.getLocation();

		model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : 'start time for treatment',
			labels : 'hypo,low',
			latitude : loc.latitude,
			longitude : loc.longitude,
			userId : app.appUser.get('sid')
		});
		timer = setInterval(this.remindRetest, 10000);
	},
	getLocation : function() {
		var suc = function(p) {
			return p.coords;//.latitude + " " + p.coords.longitude);
		};
		var locFail = function() {
			log.console("can't get location");
		};
		navigator.geolocation.getCurrentPosition(suc, locFail);
	}

};