/**
 * 
 * @param dimension
 * @returns
 */
function BuildGroups( dimension ) {

	this.dimension = dimension;

	/*this.glucoseLevelGroup = function () {

		var bgGroup = this.dimension.group().reduce(
				//add
				function(p, v) {
					if (v.glucoseLevel > 0) {
						++p.count;
					}
					p.total += v.glucoseLevel;
					p.glucoseLevel = Math.round(p.total / p.count);
					return p;
				},
				//remove
				function(p, v) {
					if (v.glucoseLevel > 0) {
						--p.count;
					}
					p.total -= v.glucoseLevel;
					p.glucoseLevel = Math.round(p.total / p.count);
					return p;
				},
				//init
				function() {
					return {
						count : 0,
						total : 0,
						glucoseLevel : 0
					};
			});
			
			return bgGroup;
	};
	
	this.bolusAmountGroup = function() {

		var bolusAmountGroup = this.dimension.group().reduce(
			//add
			function(p, v) {
				if (v.bolusAmount > 0) {
					++p.count;
				}
				p.total += v.bolusAmount;
				p.bolusAmount = Math.round(p.total / p.count);
				return p;
			},
			//remove
			function(p, v) {
				if (v.bolusAmount > 0) {
					--p.count;
				}
				p.total -= v.bolusAmount;
				p.bolusAmount = Math.round(p.total / p.count);
				return p;
			},
			//init
			function() {
				return {
					count : 0,
					total : 0,
					bolusAmount : 0
				};
		});
		
		return bolusAmountGroup;
	};

	this.insulinSensitivityGroup = function() {

		var insulinSensitivityGroup = this.dimension.group().reduce(
			//add
			function(p, v) {
				if (v.insulinSensitivity > 0) {
					++p.count;
				}
				p.total += v.insulinSensitivity;
				p.insulinSensitivity = Math.round(p.total / p.count);
				return p;
			},
			//remove
			function(p, v) {
				if (v.insulinSensitivity > 0) {
					--p.count;
				}
				p.total -= v.carbRatio;
				p.insulinSensitivity = Math.round(p.total / p.count);
				return p;
			},
			//init
			function() {
				return {
					count : 0,
					total : 0,
					insulinSensitivity : 0
				};
		});
		
		return insulinSensitivityGroup;
	};
	
	this.carbRatioGroup = function () {

		var carbRatioGroup = this.dimension.group().reduce(
			//add
			function(p, v) {
				if (v.carbRatio > 0) {
					++p.count;
				}
				p.total += v.carbRatio;
				p.carbRatio = Math.round(p.total / p.count);
				return p;
			},
			//remove
			function(p, v) {
				if (v.carbRatio > 0) {
					--p.count;
				}
				p.total -= v.carbRatio;
				p.carbRatio = Math.round(p.total / p.count);
				return p;
			},
			//init
			function() {
				return {
					count : 0,
					total : 0,
					carbRatio : 0
				};
		});
		
		return carbRatioGroup;
	};*/
	
	this.glucoseLevelGroup = function () {

		return this.dimension.group().reduceSum(function(d){ return d.glucoseLevel});
		
	};
	
	this.bolusAmountGroup = function() {

		return this.dimension.group().reduceSum(function(d){return d.bolusAmount});
	};

	this.insulinSensitivityGroup = function() {

		return this.dimension.group().reduceSum(function(d){return d.insulinSensitivity});
		
	};
	
	this.carbRatioGroup = function () {

		return this.dimension.group().reduceSum(function(d){ return d.carbRatio});
		
	};
	
	this.logBookFactsGroup = function (timeperiod) {

		var factsGroup = timeperiod.group().reduce(
				//add
				function(p, v) {
					if(v.glucoseLevel>0){
						++p.count;
					}
						p.total += v.glucoseLevel;
						p.averageGlucoseLevel = Math.round(p.total / p.count);
						if (v.glucoseLevel < 80 & v.glucoseLevel > 0) {
							++p.lows;
						} else if (v.glucoseLevel > 180) {
							++p.highs;
						} else {
							++p.inRange;
						}
					return p;
				},
				//remove
				function(p, v) {
					
					if(v.glucoseLevel>0){
						--p.count;
					}
						p.total -= v.glucoseLevel;
						p.averageGlucoseLevel = Math.round(p.total / p.count);
						if (v.glucoseLevel < 80 & v.glucoseLevel > 0) {
							--p.lows;
						} else if (v.glucoseLevel > 180) {
							--p.highs;
						} else {
							--p.inRange;
						}
					return p;
						
				},
				//init
				function() {
					return {
						total : 0,
						count: 0,
						lows : 0,
						highs : 0,
						inRange : 0,
						averageGlucoseLevel : 0
					};
			});
			
			return factsGroup;
		
	};
}
