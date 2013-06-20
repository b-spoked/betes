/**
 * 
 * @param dimension
 * @returns
 */
function BuildGroups( dimension ) {

	this.dimension = dimension;
	
	this.glucoseLevelGroup = function () {

		return this.dimension.group().reduceSum(function(d){ return d.glucoseLevel});
		
	};
	
	/*this.bolusAmountGroup = function() {

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
		
	};*/
}
