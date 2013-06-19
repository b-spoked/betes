function HypoWorkflow(model) {
	this.timer = null;
	this.model = model;

	this.addEntryWithLocation = function(comment, level, coords) {

		this.model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			glucoseLevel: level,
			comments : comment,
			labels : 'hypo,low',
			latitude : coords.latitude,
			longitude : coords.longitude,
			userId : app.appUser.get('sid')
		});
	};

	this.addEntry = function(comment,level) {

		this.model.logEntries.create({
			name : "Other",
			resultDate : new Date(),
			glucoseLevel: level,
			comments : comment,
			labels : 'hypo,low',
			userId : app.appUser.get('sid')
		});
	};

	this.startHypoProcess = function() {

		var self = this;
		var addWithLocation = function(p) {
			console.log("start hypo process w location");
			self.addEntryWithLocation("hypo recorded, given dummy level of 3.5",3.5, p.coords);
		};
		var addWithoutLocation = function() {
			//console.log("start hypo process");
			self.addEntry("hypo recorded, given dummy level of 3.5",3.5);
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		this.startRetestTimer();
		//this.alertContacts();
		this.remindProcess();
	};

	this.endHypoProcess = function() {

		var self = this;
		var addWithLocation = function(p) {
			//console.log("end hypo process w location");
			self.addEntryWithLocation("hypo treated",4.5, p.coords);
		};
		var addWithoutLocation = function() {
			//console.log("start hypo process");
			self.addEntry("hypo treated",4.5);
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		jQuery("#retest-reminder").hide();
		jQuery("#process-detail").hide();
		clearInterval(this.timer);
	};

	this.remindRetest = function() {
		jQuery("#retest-reminder").show();
		navigator.notification.vibrate(5000);
	};

	this.remindProcess = function() {
		jQuery("#process-detail").show();
	};

	this.startRetestTimer = function() {
		var fifteenMinutes = 900000;
		self.timer = setInterval(self.remindRetest, fifteenMinutes);
	};

}
