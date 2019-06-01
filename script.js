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

function winCases(state) // [ cases_where_x_wins, cases_where_o_wins, no_winners_cases, total] = winCases(state)
{

	if(stateIsFull(state) == true)
	{
		var winner = whoWin(state);
		return ( winner == 'x' ? [1,0,0,1] 
			: ( winner == 'o' ? [0,1,0,1] 
			: [0,0,1,1] ) );
	}
	
	var xSum = 0, oSum = 0, nSum = 0, tSum = 0;

	forEachGap(state, function(c, l)
	{
		var x = 0, o = 0, n = 0, t = 0; //received values
		[x,o,n,t] = winCases(stateX(state,c,l));
		xSum += x;
		oSum += o;
		nSum += n; 
		tSum += t;

		[x,o,n,t] = winCases(stateO(state,c,l));
		xSum += x;
		oSum += o;
		nSum += n;
		tSum += t;
	});

	return [xSum, oSum, nSum, tSum];
}

function oLoseProbability(state) //probability to 'o' lose
{
	var x=0, o=0, n=0, t=1;
	[x,o,n,t] = winCases(state);
	return (x+n)/t;
}

function xWinProbability(state)	//probability to 'x' wins
{
	var x=0, o=0, n=0, t=1;
	[x,o,n,t] = winCases(state);
	return x/t;
}

function oWinProbability(state)	//probability to 'x' wins
{
	var x=0, o=0, n=0, t=1;
	[x,o,n,t] = winCases(state);
	return o/t;
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
					return [c,l];
				}
			}
		}
	}

	//find the best move to X based in X win probability
	var bestXLoc = [-1,-1];
	var bestXProb = 0;

	forEachGap(state,function(c,l)
	{
		var prob = xWinProbability(stateX(state,c,l));
		if( prob > bestXProb)
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
			var prob = oLoseProbability(stateX(state,c,l));
			if( prob > bestXProb)
			{
				bestXProb = prob;
				bestXLoc = [c,l];
			}	
		});
	}

	return bestXLoc;
}

// =============================================
// ============= Events ========================
// =============================================

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
		gameEnd = true;
		drawColorLine([0,0], [d*3,d*3], '#FF0000'); //diag line
	}

	if( (currentState[2][0] == 'o' && currentState[1][1] == 'o' && currentState[0][2] == 'o') 
		|| (currentState[2][0] == 'x' && currentState[1][1] == 'x' && currentState[0][2] == 'x') )
	{
		gameEnd = true;
		drawColorLine([d*3,0], [0,d*3], '#FF0000'); //diag line
	}

	//cols
	for(var c=0; c<3; c++)
	{
		if( (currentState[c][0] == 'x' && currentState[c][1] == 'x' && currentState[c][2] == 'x') 
			|| (currentState[c][0] == 'o' && currentState[c][1] == 'o' && currentState[c][2] == 'o') )
		{
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
			gameEnd = true;
			drawColorLine([0, d*l+d/2],[d*3, d*l+d/2], '#FF0000'); //horizontal line
		}
	}
}


var stage = 0;
var gameLocked = false; //mutex to timeout
cv.addEventListener('click', function(e)
{
	if(gameLocked == true) return;

	if(gameEnd == true)
	{
		alert('Game is end. Press F5 to replay');
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
		currentState[c][l] = 'o';
		drawState(currentState);
		gameLocked = true;

		setTimeout(function() //delay
		{
			//AI play
			var xc, xl;
			if(stage == 1) //first move
			{
				//if(c == 1 && l == 1) [xc,xl] = [0,0];
				//else [xc,xl] = [1,1];
				do
				{
					xc = (Math.random()|0)%3;
					xl = (Math.random()|0)%3;
				}while( xc == c && xl == l);
			}
			else [xc,xl] = bestX(currentState);	

			console.log([xc,xl]);
			currentState[xc][xl] = 'x';

			drawState(currentState);
			detectEnd();
			gameLocked = false;

		}, 100);
	}	
});


// =============================================
// ================ Initialization =============
// =============================================

drawGrid();