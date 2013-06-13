/*
 * bi.Raphael 0.0.1 - BI library, based on Raphaël
 *
 * Copyright (c) 2010 David Gloyn-Cox (http://raphael.stackingturtles.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *  width	How wide is the control
 *	height	How high is the control
 *	value	The value to display (numeric)
 * 	markers	What markers to show (numeric)
 *			At a minimum this is expected to be the minVal and maxVal.
 *			if none provided the default will be the 
 *				min -Value ceiling
 *				max +Value ceiling		
 * 	opts	option to display the speedo.
 *		color		array of colors to use other wise uses the default raphael colors
 *		minValus	
 *		maxValue
 *		minAngle
 *		maxAngle
 *		tickMajor	interval
 *		tickMinor	interval
 *		font
 *
 *	Usage
 *		var r = Raphael("holder", 540, 400)
 *		sSpeedo = r.g.bi.speedo(10,10,300,300,123,[-20,0,20,100,200],[minAng: 225, maxAng: 0, tickMajor: 50, tickMinor: 10]);
 */
	 
 Raphael.fn.g.speedo = function (width, height, value, markers, opts, title){
	opts = opts || {};
 	markers = markers || [];

	// function to create a nromalized range to the nearest factor of 10 to the input value...
	function normalizeRange(value)
	{
		var val = Math.abs(value);
		
		// this function will return the nearest whole decade closest to the passed value
		if (val > 10000){
			factor = 10000;
		}
		else if (val > 10000){
			factor = 10000;
		}
		else if (val > 1000){
			factor = 1000;
		}
		else if (val > 100) {
			factor = 100;
		}
		else if (val > 10) {
			factor = 10;
		}
		else{
			factor = 1;
		}
		
		return ((val / factor).toFixed(0)) * factor;
	}

	function drawDial(cx, cy, minVal, maxVal, stepAng, minAng, oRad, iRad, val1, val2)
	{
		alpha1 = minAng - (stepAng * (Math.abs(minVal) + val1)),
		a1 = (alpha1) * Math.PI / 180,
		x1o = cx + oRad * Math.cos(a1),
		y1o = cy - oRad * Math.sin(a1),
		x1i = cx + iRad * Math.cos(a1),
		y1i = cy - iRad * Math.sin(a1),

		alpha2 = minAng - (stepAng * (Math.abs(minVal) + val2)),
		a2 = (alpha2) * Math.PI / 180,
		x2o = cx + oRad * Math.cos(a2),
		y2o = cy - oRad * Math.sin(a2),
		x2i = cx + iRad * Math.cos(a2),
		y2i = cy - iRad * Math.sin(a2);

		return "M " + x1o + " " + y1o +  " L " + x1i + " " + y1i  +  " A " + iRad + " " + iRad + " 0 0,1 "  + x2i + " " + y2i  +  " L " + x2o + " " + y2o + " A " + oRad + " " + oRad + " 0 0,0 " + x1o + " " + y1o + " z ";
	}

	function drawTick(cx, cy, minAng, rangeAng, oRad, iRad, tickInt, count)
	{
		alpha = minAng - ((rangeAng / tickInt) * count),
		a = (alpha) * Math.PI / 180,
		x1 = cx + oRad* Math.cos(a),
		y1 = cy - oRad * Math.sin(a),
		x2 = cx + iRad * Math.cos(a),
		y2 = cy - iRad * Math.sin(a);
        
		return "M " + x1 + " " + y1 +  " L " + x2 + " " + y2 ;	
	}
	
	function setValue(input){
		// draw the needle, draw point to zero first...
		var path = "",
			alpha = zeroAngle - (stepAngle * input),
			a = (alpha) * Math.PI / 180,
		
			x1 = cenX + cRadius * Math.cos(a - (10 * Math.PI / 180)),
			y1 = cenY - cRadius * Math.sin(a - (10 * Math.PI / 180)),

			x2 = cenX + dRadius * Math.cos(a),
			y2 = cenY - dRadius * Math.sin(a),
			
			x3 = cenX + cRadius * Math.cos(a + (10 * Math.PI / 180)),
			y3 = cenY - cRadius * Math.sin(a + (10 * Math.PI / 180)),

			path = "M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " L " + x3 + " " + y3 + " z";
				
		if(shadowSet.length > 0 && needleSet.length > 0){
			// perform a calculation...
			shadowSet.animate({"path":path},750,"bounce");
			needleSet.animate({"path":path},750,"bounce");
		}else{
			// create the shadow set...
			s = paper.path(path).attr({"fill" : "#555", "stroke" : "#555", "opacity": 0.6, "stroke-opacity" : 0.5}),
			n = paper.path(path).attr({"fill" : "#222", "stroke" : "#666"});
			d = paper.circle(cenX,cenY,cRadius).attr({"fill":"#555"})
			c = paper.circle(cenX,cenY,2).attr({"fill":"#555"})
				
			shadowSet.push(s.translate(2,2));
			needleSet.push(n);
		}
	}
	
	// initialize the variables, use the values in the options class if values are present, otherwise use defaults...
	var paper = this,
		radius = opts.radius || (width>height?height/2:width/2),
		cenX = opts.cX || width/2,
		cenY = opts.cY || height/2,
		colors = opts.colors || this.g.colors,
		value = value || 0,
		minValue = (opts.minValue || -1 * normalizeRange(value) * 2 || -100 ),
		maxValue = (opts.maxValue || normalizeRange(value) * 2 || 100),
		rangeValue = maxValue + Math.abs(minValue),
		minAngle = (opts.minAngle || 225),
		maxAngle = (opts.maxAngle || 315), // the max Angle can be below zero, but is tracked from origin anticlockwise
		rangeAngle = maxAngle>minAngle?minAngle+(360-maxAngle):minAngle - maxAngle,
		stepAngle = rangeAngle/rangeValue,
		zeroAngle = minAngle - (stepAngle * Math.abs(minValue)),
		tickMajor = (opts.tickMajor || rangeValue / 4),
		tickMinor = (opts.tickMinor || rangeValue / 20),
		useFont = opts.font || "20px sans-serif"
		tickMajOut = paper.set(),
		tickMinOut = paper.set(),
		tickLabOut = paper.set(),
		mrkupOut = paper.set(),
		needleSet = paper.set(),
		shadowSet = paper.set(),
		disTickLabels = (opts.dTLabels || false)?true:false,
		disValueLabel = (opts.dVLabels || false)?true:false,
		isSmall = opts.isSmall || ((radius <= 60)?true:false),
		xRadius = (opts.tRad || (radius - (isSmall?5:10))), 	// radius for text labels
		oRadius = (opts.oRad || (radius - (isSmall?10:20))), 	// radius for the outer edge of the ticks and dial
		iRadius = (opts.iRad || (radius - (isSmall?12:25))), 	// radius for the inner edge of the minor ticks and dial
		dRadius = (opts.dRad || (radius - (isSmall?15:30))), 	// inner edge for the dial
		mRadius = (opts.mRad || (radius - (isSmall?20:40))), 	// inner edge for the markup dial
		cRadius = (opts.nRad || (isSmall?5:10)),				//  the radius of the needle...
		f = 0;
		
	if(minValue > value || maxValue < value){
		minValue = -1 * normalizeRange(value) * 1.5;
		maxValue = normalizeRange(value) * 1.5;
	}
	
	// draw the dial for the ticks...
	paper.path(drawDial(cenX, cenY, minValue, maxValue, stepAngle, minAngle, oRadius, dRadius, minValue, 0)).attr({"fill": "#fff", "stroke": "#555"});
	paper.path(drawDial(cenX, cenY, minValue, maxValue, stepAngle, minAngle, oRadius, dRadius, 0, maxValue)).attr({"fill": "#fff", "stroke": "#555"});
	
	// display the major ticks...	
	for (i = 0;i<=tickMajor;i++)
	{		
		// display numbers for the majors
		if (disTickLabels && !isSmall){
			alpha = minAngle - ((rangeAngle / tickMajor) * i),
			a = (alpha) * Math.PI / 180,
			x3 = cenX + ((xRadius+5) * Math.cos(a)); // - (radius * Math.sin(a)),
			y3 = cenY - (xRadius * Math.sin(a)); //+ (xRadius * Math.cos(a));

			tickLabOut.push(paper.text(x3,y3,(minValue + (i * (rangeValue / tickMajor)))));
		}
		tickMajOut.push(paper.path(drawTick(cenX, cenY, minAngle, rangeAngle, oRadius, dRadius, tickMajor, i)).attr({"stroke": "#000"}));
	}
	
	// if labels are wanted but the raius is too small only display min, zero and max labels...
	if(isSmall && disTickLabels){
		// output the min value 
		alpha = minAngle + 10,
		a = (alpha) * Math.PI / 180,
		x1 = cenX + xRadius * Math.cos(a),
		y1 = cenY - xRadius * Math.sin(a);
		tickLabOut.push(paper.text(x1,y1,minValue));
		
		// output the zero Value
		alpha = zeroAngle
		a = (alpha) * Math.PI / 180,
		x1 = cenX + xRadius * Math.cos(a),
		y1 = cenY - xRadius * Math.sin(a);
		tickLabOut.push(paper.text(x1,y1,"0"));
			
		// output the max Value
		alpha = maxAngle - 10,
		a = (alpha) * Math.PI / 180,
		x1 = cenX + xRadius * Math.cos(a),
		y1 = cenY - xRadius * Math.sin(a);
		tickLabOut.push(paper.text(x1,y1,maxValue));		
	}
	
	// set the minor ticks...
	for (i = 0;i<=tickMinor;i++)
	{
		tickMinOut.push(paper.path(drawTick(cenX, cenY, minAngle, rangeAngle, oRadius, iRadius, tickMinor, i)).attr({"stroke": "#333"}));
	}
	
	// draw the color circles...
	lastValue = minValue;
	for(i = 0; i < markers.length;i++)
	{
		currValue = markers[i];
		
		if(lastValue < currValue && currValue <= maxValue)
		{
			// we have an arc
			mrkupOut.push(paper.path(drawDial(cenX, cenY, minValue, maxValue, stepAngle, minAngle, dRadius, mRadius, lastValue, currValue)).attr({"fill": colors[i], "stroke": colors[i]}));
			lastValue = currValue;
		}
	}

	setValue(0);
	setValue(value);
	
	// display the value label
	if(disValueLabel){
		paper.text(cenX, cenY + dRadius/2, value).attr({"font": useFont});
	}
	if(title != "" ){
		paper.text(cenX, cenY + xRadius, title).attr({"font": useFont});
	}
}
