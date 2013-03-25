window.hypoWorkflow = {
		var timer = null;
		
		startHypoProcess: function() {
			alert('start process');
			this.startRetestTimer();
	    },

	    endHypoProcess: function () {
	    	alert('all good so lets stop');
	    	clearInterval(timer);
	    },
	    
	    trackLocation: function () {
	    	alert('start tracking location');
	    },

	    alertContacts: function () {
	    	alert('tell contact you having a hypo');
	    },

	    alertContactsOK: function () {
	    	alert('tell contacts your OK');
	    },

	    remindRetest: function() {
	    	alert('Hey retest to see your sugar is OK');
	    },

	    remindProcess: function() {
	    	alert('sugar-retest after 15 - if low repeat - otherwise have x grams carbs');
	    },
	    
	    startRetestTimer: function () {
	    	timer = setInterval( this.remindRetest, 60000 ); 
	    }
	    
	};