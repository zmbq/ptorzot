package com.platonix.ptorzot.level;

import com.platonix.ptorzot.Formattings;
import com.platonix.ptorzot.GameState;
import com.platonix.ptorzot.R;
import com.platonix.ptorzot.GameState.OnePlay;

public class HardLevel extends GameLevel 
{
	public HardLevel()
	{
		super(2, R.drawable.red, R.string.level3_short, R.string.level3_long);
	}
	
	@Override
	public GameState createNewGame() 
	{
		int[] numbers = new int[5];
		int target = createSolvableGame(numbers, 60, 120);
    	return new GameState(this, numbers, target);
	}

	@Override
	public void getNextLabels(String[] labels, OnePlay play) 
	{
		String first = labels[play.getFirst()];
		if(first.length() > 2)
			first = "(" + first + ")";
	
		String second = labels[play.getSecond()];
		if(second.length() > 2)
			second = "(" + second + ")";
	
		String newLabel = first + " " + Formattings.getOpString(play.getOp()) + " " + second;
		
    	// Put the new label in first, remove second
    	labels[play.getFirst()] = newLabel;
    	for(int i=play.getSecond(); i<4; i++)
    		labels[i] = labels[i+1];
	}
}
