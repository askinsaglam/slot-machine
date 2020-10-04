const SLOTS_PER_REEL = 10;
// radius = Math.round( ( panelWidth / 2) / Math.tan( Math.PI / SLOTS_PER_REEL ) ); 
// current settings give a value of 123
const REEL_RADIUS = 123;

const Symbols = ["3xBAR", "BAR", "2xBAR", "7", "Cherry", "3xBAR", "BAR", "2xBAR", "7", "Cherry"]

const SpinValues = [-3710, -3746, -3782, -3818, -3854, -3890, -3926, -3962, -3998, -4034];

const LineType = {
    TOP: 'top',
    CENTER: 'center',
    BOTTOM: 'bottom',
}

function createSlots (ring) {
	
	var slotAngle = 360 / SLOTS_PER_REEL;

	for (var i = 0; i < SLOTS_PER_REEL; i ++) {
		var slot = document.createElement('div');
		
		slot.className = 'slot';
		slot.id = 'slot-'+ i;

		// compute and assign the transform for this slot
		var transform = 'rotateX(' + (slotAngle * i) + 'deg)   translateZ(' + REEL_RADIUS + 'px)';

		slot.style.transform = transform;

		// setup the image to show inside the slots
		// the position is randomized to 
		var content = $(slot).append('<img src="images/'+Symbols[i]+'.png" alt="'+Symbols[i]+'" height="60" width="60" >');

		// add the poster to the row
		ring.append(slot);
	}
}

function getSeed() {
	// generate random number
	return Math.floor(Math.random()*(SLOTS_PER_REEL));
}

function getIndexOnCenterLine(seed) {
	let degVal = SpinValues[seed];
	let symbolIndex = Math.abs(Math.round((degVal % 360) / 36));
	return symbolIndex;
}

function getIndexOnBottomLine(seed) {
	let degVal = SpinValues[seed];
	let symbolIndex = Math.abs(Math.round((degVal % 360) / 36));
	if(symbolIndex == 0){
	   symbolIndex = 10;	
	}
	return symbolIndex - 1;
}

function getIndexOnTopLine(seed) {
	let degVal = SpinValues[seed];
	let symbolIndex = Math.abs(Math.round((degVal % 360) / 36));
	if(symbolIndex == 9){
	   symbolIndex = -1;	
	}
	return symbolIndex + 1;
}


function calculatePayouts(line, lineType) {
	if (line.toString() == "Cherry,Cherry,Cherry" && lineType === LineType.TOP){
		Blink(1);
		return 2000;
	}else if (line.toString() == "Cherry,Cherry,Cherry" && lineType === LineType.CENTER){
		Blink(2);
		return 1000;
	}else if (line.toString() == "Cherry,Cherry,Cherry" && lineType === LineType.BOTTOM){
	    Blink(3);
		return 4000;
	}else if (line.toString() == "7,7,7"){
		Blink(4);
		return 150;
	}else if (!line.includes("2xBAR") && !line.includes("3xBAR") && !line.includes("BAR")){
		Blink(5);
		return 75;
	}else if (line.toString() == "3xBAR,3xBAR,3xBAR"){
		Blink(6);
		return 50;
	}else if (line.toString() == "2xBAR,2xBAR,2xBAR"){
	    Blink(7);
		return 20;
	}else if (line.toString() == "BAR,BAR,BAR"){
		Blink(8);
		return 10;
	}else if (!line.includes("7") && !line.includes("Cherry")){
	    Blink(9);
		return 5;
	}else {
		return 0;
	}
}



function Blink(rowNum) {
	var interval = setInterval(function(){$('#row'+rowNum).fadeOut(500).fadeIn(500);},500);
    setTimeout(function(){clearInterval(interval);}, 3000);
}

function getPrice(balance) {
	$('#balance').val(balance-1);
}

function addPayouts(sum) {
	let balance = $('#balance').val();
	let total = parseInt(sum) + parseInt(balance);
	$('#balance').val(total);
}

const sleep = function(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function randomSpin(timer) {
	let balance = $('#balance').val();
	getPrice(balance);

	let sum = 0;
	let centerLine = [];
	let topLine = [];
	let bottomLine = [];
 

	for(var i = 1; i < 4; i ++) {
		var oldSeed = -1;

		var oldClass = $('#ring'+i).attr('class');
		if(oldClass.length > 4) {
			oldSeed = parseInt(oldClass.slice(10));
		}
		var seed = getSeed();
		while(oldSeed == seed) {
			seed = getSeed();
		}
    
	    $('#ring'+i).css('animation','spin-' + seed + ' ' + (timer + i*0.5) + 's')
			        .attr('class','ring spin-' + seed);
	    
		
		var valTop = $('#ring'+i+' #slot-'+getIndexOnTopLine(seed)+' img').attr('alt');	
		var valCenter = $('#ring'+i+' #slot-'+getIndexOnCenterLine(seed)+' img').attr('alt');
		var valBottom = $('#ring'+i+' #slot-'+getIndexOnBottomLine(seed)+' img').attr('alt');

		topLine.push(valTop);
		centerLine.push(valCenter);
		bottomLine.push(valBottom);		
	}
	
	sleep(2000).then(function(){
		
		sum = calculatePayouts(topLine, LineType.TOP);
		sum = sum + calculatePayouts(centerLine, LineType.CENTER);
		sum = sum + calculatePayouts(bottomLine, LineType.BOTTOM);

		addPayouts(sum); 
	});

}

function fixedSpin(symbolArr, positionArr){
	let balance = $('#balance').val();
	getPrice(balance);

	let sum = 0;
	let centerLine = [];
	let topLine = [];
	let bottomLine = [];
				 
	for(var i = 1; i < 4; i ++) {

        let index = Symbols.indexOf(symbolArr[i-1]);
	    let spinNum = findSpinDegClass(index, positionArr[i-1]);
	    $('#ring'+i).css('animation','spin-' + spinNum + ' ' + '1s')
					 .attr('class','ring spin-' + spinNum);

		var valTop = $('#ring'+i+' #slot-'+getIndexOnTopLine(spinNum)+' img').attr('alt');	
		var valCenter = $('#ring'+i+' #slot-'+getIndexOnCenterLine(spinNum)+' img').attr('alt');
		var valBottom = $('#ring'+i+' #slot-'+getIndexOnBottomLine(spinNum)+' img').attr('alt');

		topLine.push(valTop);
		centerLine.push(valCenter);
		bottomLine.push(valBottom);		
	}


	sleep(1000).then(function(){
		console.log(topLine);
		console.log(centerLine);
		console.log(bottomLine);
		
		sum = calculatePayouts(topLine, LineType.TOP);
		sum = sum + calculatePayouts(centerLine, LineType.CENTER);
		sum = sum + calculatePayouts(bottomLine, LineType.BOTTOM);

		addPayouts(sum); 
	});
}

function findSpinDegClass(index, position) {
	switch (position) {
		case LineType.TOP:
				if (index == 3) {
					return 9;
				} else if (index == 2) {
					return 8;
				} else if (index == 1) {
					return 7;
				} else if (index == 0) {
					return 6;
				} else {
					return index - 4;
				}
		case LineType.CENTER:
				if (index == 2) {
					return 9;
				} else if (index == 1) {
					return 8;
				} else if (index == 0) {
					return 7;
				} else {
					return index - 3;
				}
		case LineType.BOTTOM:
				if (index == 1) {
					return 9;
				} else if (index == 0) {
					return 8;
				} else {
					return index - 2;
				}			
		default:
			break;
	}
}



$(document).ready(function() {
    
 	createSlots($('#ring1'));
 	createSlots($('#ring2'));
 	createSlots($('#ring3'));

 	$('.go').on('click',function(){

		var gamemode = $("input[name='gamemode']:checked").val();
		
		if(gamemode == "Random"){
			var timer = 1;
			randomSpin(timer);
		} else{
			var symbol1 = $("input[name='r1symbols']:checked").val();
			var position1 = $("input[name='r1positions']:checked").val();
			var symbol2 = $("input[name='r2symbols']:checked").val();
			var position2 = $("input[name='r2positions']:checked").val();
			var symbol3 = $("input[name='r3symbols']:checked").val();
			var position3 = $("input[name='r3positions']:checked").val();

			let symbols = [symbol1, symbol2, symbol3];
			let positions = [position1, position2, position3];

	
			fixedSpin(symbols, positions);
		}

 	})
 
});