var timer = null;

window.hypoWorkflow = {
		
		
		startHypoProcess: function(model) {
			model.logEntries.create({name:"Other", resultDate:new Date(),comments:'hypo recorded', userId : app.appUser.get('sid')});
			this.startRetestTimer(model);
			this.alertContacts(model);
			this.remindProcess();
	    },

	    endHypoProcess: function (model) {
	    	model.logEntries.create({name:"Other", resultDate:new Date(),comments:'Hypo treated', userId : app.appUser.get('sid')});	    		    	
	    	this.alertContactsOK(model);
	    	jQuery("#retest-reminder").hide();
	    	jQuery("#process-detail").hide();	
	    	clearInterval(timer);
	    },
	    
	    trackLocation: function () {
	    	alert('start tracking location');
	    },

	    alertContacts: function (model) {
	    	model.logEntries.create({name:"Other", resultDate:new Date(),comments:'Alerting contacts that your having a hypo', userId : app.appUser.get('sid')});	    	
	    },

	    alertContactsOK: function (model) {
	    	model.logEntries.create({name:"Other", resultDate:new Date(),comments:'Alerting contacts that your OK', userId : app.appUser.get('sid')});	    		    		    	//
	    },

	    remindRetest: function(model) {
	    	app.appUser.logEntries.create({name:"Other", resultDate:new Date(),comments:'Time has past now retest', userId : app.appUser.get('sid')});
	    	jQuery("#retest-reminder").show();		    	
	    },

	    remindProcess: function() {	    	
	    	jQuery("#process-detail").show();	
	    },
	    
	    startRetestTimer: function (model) {
	    	
	    	model.logEntries.create({name:"Other", resultDate:new Date(),comments:'start time for treatment', userId : app.appUser.get('sid')});
	    	timer = setInterval( this.remindRetest, 10000 ); 
	    }
	    
	};