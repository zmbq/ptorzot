package com.platonix.ptorzot.level;

import com.platonix.ptorzot.Formattings;
import com.platonix.ptorzot.GameState;
import com.platonix.ptorzot.R;
import com.platonix.ptorzot.GameState.OnePlay;

public class EasyLevel extends GameLevel 
{
	public EasyLevel()
	{
		super(0, R.drawable.green, R.string.level1_short, R.string.level1_long);
	}
	
	@Override
	public GameState createNewGame() 
	{
		int[] numbers = new int[5];
		int target = createSolvableGame(numbers, 11, 40);
    	return new GameState(this, numbers, target);
	}

	@Override
	public void getNextLabels(String[] labels, OnePlay play) 
	{
		for(int i=0; i<5; i++)
			labels[i] = Formattings.getPrintedNumber(play.getNumbersPost()[i]);
	}
}
