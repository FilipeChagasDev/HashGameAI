/*
	Author: Filipe Chagas Ferraz
	Nationality: Brazil
	Email: filipe.ferraz0@gmail.com
	GitHub: github.com/FilipeChagasDev

	Algorithm description:
		This is a simple IA algorithm based on deep searh and probability calculation.
		The goal is to try to prevent, as far as possible, that the user wins the hash game.
		To play the hash game, the user uses the 'o' symbol, and the AI uses the 'x' symbol.
*/

// =============================================
// ============= graphic functions =============
// =============================================

var cv = document.getElementById('cv');
var context = cv.getContext('2d');

var d = 100; //default offset

function drawLine(pi,pf)
{
	context.beginPath();
	context.moveTo(pi[0],pi[1]);
	context.lineTo(pf[0],pf[1]);
	context.lineWidth = 5;
	context.stroke();
}

function drawColorLine(pi,pf,color)
{
	context.beginPath();
	context.moveTo(pi[0],pi[1]);
	context.lineTo(pf[0],pf[1]);
	context.lineWidth = 2;
	context.strokeStyle = color;
	context.stroke();
}

function drawCircle(p,r)
{	context.beginPath();
	context.ellipse(p[0], p[1], r, r, Math.PI/4, 0, 2*Math.PI);
	context.stroke();
}   

function drawGrid()
{
	context.beginPath();
	context.fillStyle = "#FFFFFF";
	context.fillRect(0,0,d*3,d*3);
	context.stroke();

	for(var i=0;i<=3;i++)
	{	// v lines
		var x = i*d;
		drawLine([x,0], [x,d*3]);
	}

	
	for(var j=0;j<=3;j++)
	{	// h lines
		var y = j*d;
		drawLine([0,y], [d*3,y]);
	}
}

function drawX(col,lin)
{
	var x = col*d, y = lin*d, x1 = (col+1)*d, y1 = (lin+1)*d;
	var bound = 20;
	drawLine([x+bound,y+bound], [x1-bound,y1-bound]);
	drawLine([x1-bound,y+bound], [x+bound,y1-bound]);  	
}

function drawO(col,lin)
{
	var x = col*d + d/2, y = lin*d + d/2;
	var r = 30;
	drawCircle([x,y],r);  	
}

function resetGrid()
{
	//context.clearRect(0, 0, cv.width, cv.height);
	drawGrid();
}

// =============================================
// ============= state functions ===============
// =============================================

var currentState = [ ['','',''], ['','',''], ['','',''] ]; //state[col][lin]

function forEachGap(state, callback)
{
	for(var c=0; c<3; c++)
	{
		for(var l=0; l<3; l++)
		{
			if(state[c][l] == '')
			{ 
				callback(c,l);
			}
		}
	}
}


function cloneState(state)
{
	var new_state = [ ['','',''], ['','',''], ['','',''] ];
	for(var c=0;c<3;c++)
	{
		for(var l=0;l<3;l++)
		{
			new_state[c][l] = state[c][l];
		}	
	}
	return new_state;
}

function stateX(state, col,lin) //return a new state array with a X 
{
	//var new_state = [...state];
	var new_state = cloneState(state);
	new_state[col][lin] = 'x';
	return new_state;
}

function stateO(state, col,lin) //return a new state array with a O 
{
	//var new_state = [...state];
	var new_state = cloneState(state);
	//var new_state = state.map((n)=>(n));
	new_state[col][lin] = 'o';
	return new_state;
}

function drawState(state)
{
	resetGrid();

	for(var c=0;c<3;c++)
	{
		for(var l=0;l<3;l++)
		{
			if(state[c][l] == 'x') drawX(c,l);
			else if(state[c][l] == 'o') drawO(c,l);
		}
	}
}

// =============================================
// =============== AI agent ====================
// =============================================

function stateIsFull(state) // returns true or false
{
	for(var c=0; c<3; c++)
	{
		for(var l=0; l<3; l++)
		{
			if(state[c][l] == '') return false; 
		}
	}
	return true;
}

function whoWin(state) // returns 'x' or 'o' or '' 
{

	// -------- O wins ? ----------
	// strategically, the rival should be analyzed first

	//diags
	if(state[0][0] == 'o' && state[1][1] == 'o' && state[2][2] == 'o') return 'o';
	if(state[2][0] == 'o' && state[1][1] == 'o' && state[0][2] == 'o') return 'o';

	//cols
	for(var c=0; c<3; c++)
	{
		if(state[c][0] == 'o' && state[c][1] == 'o' && state[c][2] == 'o') return 'o';
	}

	//lines
	for(var l=0; l<3; l++)
	{
		if(state[0][l] == 'o' && state[1][l] == 'o' && state[2][l] == 'o') return 'o';
	}

	// ---------- X wins ? -------------

	//diags
	if(state[0][0] == 'x' && state[1][1] == 'x' && state[2][2] == 'x') return 'x';	
	if(state[2][0] == 'x' && state[1][1] == 'x' && state[0][2] == 'x') return 'x';

	//cols
	for(var c=0; c<3; c++)
	{
		if(state[c][0] == 'x' && state[c][1] == 'x' && state[c][2] == 'x') return 'x';
	}

	//lines
	for(var l=0; l<3; l++)
	{
		if(state[0][l] == 'x' && state[1][l] == 'x' && state[2][l] == 'x') return 'x';
	}

	return '';
}

function winCases(state, distance = 1) // [ cases_where_x_wins, x_wins_distance_sum, cases_where_o_wins, o_wins_distance_sum, no_winners_cases, no_winners_distance_sum, total] = winCases(state)
{

	if(stateIsFull(state) == true)
	{
		var winner = whoWin(state);
		return ( winner == 'x' ? [1,distance,0,0,0,0,1] 
			: ( winner == 'o' ? [0,0,1,distance,0,0,1] 
			: [0,0,0,0,1,distance,1] ) );
	}
	
	var xSum=0, dxSum=0, oSum=0, doSum=0, nSum=0, dnSum=0, tSum=0;

	forEachGap(state, function(c, l)
	{
		var x,dx,o,do_,n,dn,t; //received values
		[x,dx,o,do_,n,dn,t] = winCases(stateX(state,c,l), distance + 1);
		xSum += x;
		dxSum += dx;
		oSum += o;
		doSum += do_;
		nSum += n;
		dnSum += dn;
		tSum += t;

		[x,dx,o,do_,n,dn,t] = winCases(stateO(state,c,l), distance + 1);
		xSum += x;
		dxSum += dx;
		oSum += o;
		doSum += do_;
		nSum += n;
		dnSum += dn;
		tSum += t;
	});

	return [xSum, dxSum, oSum, doSum, nSum, dnSum, tSum];
}

//probability to 'o' lose
function oLoseProbability(state) //[probability, average_distance] = oLoseProbability(state) 
{
	var x,dx,o,do_,n,dn,t; //received values
	[x,dx,o,do_,n,dn,t] = winCases(state);
	return [(x+n)/t, (dx+dn)/t];
}

//probability to 'x' win
function xWinProbability(state)	//[probability, average_distance] = xWinProbability(state) 
{ 
	var x,dx,o,do_,n,dn,t; //received values
	[x,dx,o,do_,n,dn,t] = winCases(state);
	return [x/t, dx/t];
}

//probability to 'x' win
function oWinProbability(state)	//[probability, average_distance] = oWinProbability(state) 
{
	var x,dx,o,do_,n,dn,t; //received values
	[x,dx,o,do_,n,dn,t] = winCases(state);
	return [o/t, do_/t];
}

function bestX(state) // [col,lin] = bestX(state)
{
	
	//verify whether one of the next possible moves will make X wins
	// OBS: This naked for statement cannot be substituted by the forEachGap because of return use 
	for(var c=0; c<3; c++)
	{
		for(var l=0; l<3; l++)
		{
			if(state[c][l] == '')
			{
				var nextMove = stateX(state,c,l);
				if( whoWin(nextMove) == 'x')
				{
					console.log('AI found a way to win: ' + [c,l]);
					return [c,l];
				}
			}
		}
	}

	// verify whether one of the next possible moves from the user will make X lose
	// OBS: This naked for statement cannot be substituted by the forEachGap because of return use
	for(var c=0; c<3; c++)
	{
		for(var l=0; l<3; l++)
		{
			if(state[c][l] == '')
			{
				var nextMove = stateO(state,c,l);
				if( whoWin(nextMove) == 'o')
				{
					console.log('AI has found a way to prevent the user from winning: ' + [c,l]);
					return [c,l];
				}
			}
		}
	} 

	//find the best move to X based in the ration of X win probability and O win probability
	console.log('Starting probability calculation...');
	console.log('_ px = AI winning probability');
	console.log('_ po = User winning probability');
	var bestXLoc = [-1,-1];
	var bestRatio = 0;

	forEachGap(state,function(c,l)
	{
		var probx, probo /*,distx, disto*/;
		[probx,NaN] = xWinProbability(stateX(state,c,l));
		[probo,NaN] = oWinProbability(stateX(state,c,l));

		var ratio = probx/probo;
		console.log('_ if AI puts x in ' + [c,l] + ': px/po=' + ratio);

		if( ratio > bestRatio)
		{
			bestRatio = ratio;
			bestXLoc = [c,l];
		} 
	});

	console.log('_ The best px/po ratio found is: ' + bestRatio);
	
	/*
	var bestXProb = 0, bestXLoc = [-1,-1];
	forEachGap(state,function(c,l)
	{
		var prob, dist;
		[prob,dist] = xWinProbability(stateX(state,c,l));

		if( prob/dist > bestXProb)
		{
			bestXProb = prob;
			bestXLoc = [c,l];
		} 
	});
	
	var oWinProb = bestXProb != 0 ? oWinProbability(stateX(state,bestXLoc[0],bestXLoc[1])) : 0;

	if(bestXProb == 0 || oWinProb > bestXProb) //if there are no cases where the X wins, use the O lose probability
	{
		//find the best move to X based in O lose probability
		forEachGap(state,function(c,l)
		{
			var prob, dist;
			[prob,dist] = oLoseProbability(stateX(state,c,l));
			if( prob/dist > bestXProb)
			{
				bestXProb = prob;
				bestXLoc = [c,l];
			}	
		});
	}
	*/

	return bestXLoc;
}

// =======================================================
// ============= Action Interface ========================
// =======================================================



// returns the column and the line where the hash was clicked
function detectCL(x,y)	// [col,lin] = detectCL(x,y)
{
	return [ x/d|0, y/d|0]; 
}

var gameEnd = false;

function detectEnd()
{
	//diags
	if( (currentState[0][0] == 'o' && currentState[1][1] == 'o' && currentState[2][2] == 'o') 
		|| (currentState[0][0] == 'x' && currentState[1][1] == 'x' && currentState[2][2] == 'x') )
	{
		console.log('line formed in main diagonal');
		gameEnd = true;
		drawColorLine([0,0], [d*3,d*3], '#FF0000'); //diag line
	}

	if( (currentState[2][0] == 'o' && currentState[1][1] == 'o' && currentState[0][2] == 'o') 
		|| (currentState[2][0] == 'x' && currentState[1][1] == 'x' && currentState[0][2] == 'x') )
	{
		console.log('line formed in secondary diagonal');
		gameEnd = true;
		drawColorLine([d*3,0], [0,d*3], '#FF0000'); //diag line
	}

	//cols
	for(var c=0; c<3; c++)
	{
		if( (currentState[c][0] == 'x' && currentState[c][1] == 'x' && currentState[c][2] == 'x') 
			|| (currentState[c][0] == 'o' && currentState[c][1] == 'o' && currentState[c][2] == 'o') )
		{
			console.log('line formed in column=' + c);
			gameEnd = true;
			drawColorLine([d*c+d/2, 0], [d*c+d/2, d*3], '#FF0000') //vertical line
		}
	}

	//lines
	for(var l=0; l<3; l++)
	{
		if( (currentState[0][l] == 'x' && currentState[1][l] == 'x' && currentState[2][l] == 'x')
			|| (currentState[0][l] == 'o' && currentState[1][l] == 'o' && currentState[2][l] == 'o') )
		{
			console.log('line formed in line=' + l);
			gameEnd = true;
			drawColorLine([0, d*l+d/2],[d*3, d*l+d/2], '#FF0000'); //horizontal line
		}
	}

	if(stateIsFull(currentState) == true)
	{ 
		console.log('all gaps were filled');
		gameEnd = true;
	}
}


function firstXMove(oc,ol) //random move 
{
	var xc,xl;
	if(oc != 1 && ol != 1)
	{
		//if the user not chose [1,1], the besy px/po ration value will aways stay in [1,1]
		[xc,xl] = [1,1];
	}
	else
	{
		//if the user chose [1,1], the px/po ration value will be 0.4875 in [0,0] [0,2] [2,0] and [2,2]
		do
		{
			xc = ((Math.random()*100|0)%2)*2; //returns 0 or 2
			xl = ((Math.random()*100|0)%2)*2; //returns 0 or 2
			console.log("loop:" + [xc,xl]);
		}while(xc == oc && xl == ol);
	}
	
	console.log('AI chose strategically: ' + [xc,xl]);
	return [xc,xl];
}

function randomMove()
{
	do
	{
		xc = (Math.random()*100|0)%3;
		xl = (Math.random()*100|0)%3;
		console.log("loop:" + [xc,xl]);
	}while(currentState[xc] == '' && currentState[xl] == '');

	console.log('AI randomly chose: ' + [xc,xl]);
	return [xc,xl];
}

function antiSideMove()
{

}


var stage = 0;
var gameLocked = false; //mutex to timeout
//var gameReseted = false; //true when the user has just requested a reset and has not made a move yet

cv.addEventListener('click', function(e)
{
	if(gameLocked == true) return;
	//if(gameReseted == true) gameReseted = false;

	if(gameEnd == true)
	{
		alert('Game is over');
		return;
	}

	stage++;
	var x = e.pageX - cv.offsetLeft;
	var y = e.pageY - cv.offsetTop;
	var c,l;
	[c,l] = detectCL(x,y);
	if(currentState[c][l] == '')
	{
		//user play
		console.log('User chose: ' + [c,l]);
		currentState[c][l] = 'o';
		drawState(currentState);
		
		// verify whether the 'o' win
		detectEnd(); 
		if(gameEnd == true) return; //stop the play if so
		// --------------------------

		gameLocked = true;

		setTimeout(function() //delay
		{
			//verify whether the user has just requested a reset
			//if(gameReseted == true) return;
			// ---------------------------------------

			//AI play
			var xc = -1, xl = -1;
			if(stage == 1) //first move
			{
				[xc,xl] = firstXMove(c,l);
				//[xc,xl] = bestX(currentState);	
			}
			else [xc,xl] = bestX(currentState);	

			console.log('AI chose: ' + [xc,xl]);

			if(xc != -1 && xl != -1) currentState[xc][xl] = 'x';
			else 
			{
				console.log('it is no longer possible to have a winner for the game');
				[xc,xl] = randomMove();
				currentState[xc][xl] = 'x';
			}

			drawState(currentState);
			detectEnd();
			gameLocked = false;

		}, 100);
	}	
});

function resetGame()
{
	location.reload();	
}

// Reset button
var resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetGame);



// =============================================
// ================ Initialization =============
// =============================================

drawGrid();
