package com.platonix.ptorzot.level;

import java.util.Random;

import com.platonix.ptorzot.Formattings;
import com.platonix.ptorzot.GameState;

public abstract class GameLevel 
{
	private int _levelValue, _imageId, _stringId, _longStringId;
	private final static int MAX_ITERS = 1000;
	
	protected GameLevel(int levelValue, int imageId, int stringId, int longStringId)
	{
		_levelValue = levelValue;
		_imageId = imageId;
		_stringId = stringId;
		_longStringId = longStringId;
	}
	
	public int getValue() { return _levelValue; }
	public int getLevelImageId() { return _imageId; }
	public int getLevelTextId() { return _stringId; }
	public int getLevelLongTextId() { return _longStringId; }

	protected int createSolvableGame(int[] numbers, int minTarget, int maxTarget)
	{
		if(numbers.length!=5)
			throw new IllegalArgumentException("numbers must be an array of size 5");
		
		Random random = new Random();
		for(int i=0; i<5; i++)
			numbers[i] = random.nextInt(9) + 1;
		int target = findSolvableTarget(random, numbers, minTarget, maxTarget);
		
		return target;
	}
	
	protected int findSolvableTarget(Random random, int[] numbers, int minTarget, int maxTarget)
	{
		String ops = "+-*/";
		int loopCount = 0;
		int minFound = 99999999, maxFound=-1;
		int iTarget = 0;
		
		do
		{
			double target = numbers[0];
			for(int i=1; i<5; i++)
			{
				char op = ops.charAt(random.nextInt(4));
				target = Formattings.applyOperation(target, numbers[i], op);
			}
			if(!isInt(target) || target<0) // This isn't considered a good target, try again without counting
				continue;
			
			iTarget = (int)target;
			if(iTarget < minFound)
				minFound = iTarget;
			if(iTarget > maxFound)
				maxFound = iTarget;
			loopCount++;
		} while((iTarget<minTarget || iTarget>maxTarget) && loopCount<MAX_ITERS);

		if(loopCount==MAX_ITERS)
			return minFound;
		
		return iTarget;
	}
		
	private boolean isInt(double num)
	{
		return num-Math.floor(num) < 1e-6;
	}
	
	public abstract GameState createNewGame();
	public abstract void getNextLabels(String[] labels, GameState.OnePlay play);
	
	public static final GameLevel Easy = new EasyLevel();
	public static final GameLevel Medium = new MediumLevel();
	public static final GameLevel Hard = new HardLevel();
	
	public static GameLevel fromValue(int value)
	{
		if(value==Easy.getValue())
			return Easy;
		if(value==Medium.getValue())
			return Medium;
		if(value==Hard.getValue())
			return Hard;
		throw new IllegalArgumentException("Invalid level value " + ((Integer)value).toString());
	}
}

/*    	switch(_game.getLevel())
{
case Easy:
	idLevelImage = R.drawable.green;
	idLevelText = R.string.level1_short;
	break;
case Medium:
	idLevelImage = R.drawable.yellow;
	idLevelText = R.string.level2_short;
	break;
case Hard:
	idLevelImage = R.drawable.red;
	idLevelText = R.string.level3_short;
} */

