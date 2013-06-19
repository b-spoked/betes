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
			console.log("start hypo process w location");
			//self.addEntryWithLocation("hypo recorded", p.coords);
		};
		var addWithoutLocation = function() {
			console.log("start hypo process");
			//self.addEntry("hypo recorded");
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
			console.log("end hypo process w location");
			//self.addEntryWithLocation("hypo treated", p.coords);
		};
		var addWithoutLocation = function() {
			console.log("start hypo process");
			//self.addEntry("hypo treated");
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		//this.alertContactsOK();
		jQuery("#retest-reminder").hide();
		jQuery("#process-detail").hide();
		clearInterval(this.timer);
	};

	this.remindRetest = function() {

		var self = this;
		var addWithLocation = function(p) {
			console.log("retest with location");
			//self.addEntryWithLocation("Time to retest", p.coords);
		};
		var addWithoutLocation = function() {
			console.log("retest process");
			//self.addEntry("Time to retest");
		};
		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		jQuery("#retest-reminder").show();
		navigator.notification.vibrate(5000);
	};

	this.remindProcess = function() {
		jQuery("#process-detail").show();
	};

	this.startRetestTimer = function() {

		var self = this;

		var addWithLocation = function(p) {
			console.log("start timer w loaction");
			//self.addEntryWithLocation("start retest timer", p.coords);
		};

		var addWithoutLocation = function() {

			console.log("start timer ");
			//self.addEntry("start retest timer");
		};

		navigator.geolocation.getCurrentPosition(addWithLocation,
				addWithoutLocation);

		var fifteenMinutes = 900000;
		// 15 mins
		self.timer = setInterval(self.remindRetest, fifteenMinutes);
	};

}
