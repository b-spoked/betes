function HypoWorkflow(model) {
	this.timer = null;
	this.model = model;

	this.addEntryWithLocation = function(comment, coords) {

		this.model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : comment,
			labels : 'hypo,low',
			latitude : coords.latitude,
			longitude : coords.longitude,
			userId : app.appUser.get('sid')
		});
	};

	this.addEntry = function(comment) {

		this.model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			comments : comment,
			labels : 'hypo,low',
			userId : app.appUser.get('sid')
		});
	};

	this.startHypoProcess = function() {
		
		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation("hypo recorded", p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("hypo recorded");
		};
		
		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		this.startRetestTimer();
		this.alertContacts();
		this.remindProcess();
	};

	this.endHypoProcess = function() {

		
		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation("hypo treated", p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("hypo treated");
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);
		
		this.alertContactsOK();
		jQuery("#retest-reminder").hide();
		jQuery("#process-detail").hide();
		clearInterval(this.timer);
	};

	this.trackLocation = function() {
		alert('start tracking location');
	};

	this.alertContacts = function() {

		
		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation(
					"Alerting contacts that your having a hypo", p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("Alerting contacts that your having a hypo");
		};
		
		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);
	};

	this.alertContactsOK = function() {

		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation("Alerting contacts that your OK",
					p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("Alerting contacts that your OK");
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);
	};

	this.remindRetest = function() {

		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation("Time to retest", p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("Time to retest");
		};
		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);
		
		jQuery("#retest-reminder").show();
		navigator.notification.vibrate(1000);
	};

	this.remindProcess = function() {
		jQuery("#process-detail").show();
	};

	this.startRetestTimer = function() {

		var self = this;
		var addWithLocation = function(p) {
			self.addEntryWithLocation("start retest timer", p.coords);
		};
		var addWithoutLocation = function() {
			self.addEntry("start retest timer");
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);
		// 15 mins
		this.timer = setInterval(self.remindRetest, (15 x 60 x 1000));
	};

}
