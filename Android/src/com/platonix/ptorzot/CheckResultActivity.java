package com.platonix.ptorzot;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.platonix.ptorzot.GameState.OnePlay;

public class CheckResultActivity extends Activity 
{
	private GameState _game;
	private TextView _target, _numbers, _progress, _wrongText;
	private ImageView _rightImage;
	private Button _close;

	// Response codes
	public static final int RIGHT_RESULT = 1;
	public static final int WRONG_RESULT = 2;
	
    @Override
    public void onCreate(Bundle savedInstanceState) 
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_result);
        
        Intent intent = getIntent();
        _game = (GameState)intent.getExtras().get("play");
        loadControls();
        setControlContent();
    }
    
    private void loadControls()
    {
    	_target = (TextView)findViewById(R.id.target);
    	_numbers = (TextView)findViewById(R.id.numbers);
    	_progress = (TextView)findViewById(R.id.progress);
    	_wrongText = (TextView)findViewById(R.id.wrongText);
    	_rightImage = (ImageView)findViewById(R.id.rightImage);
    	_close = (Button)findViewById(R.id.close);
    }
    
    private void setControlContent()
    {
    	_target.setText(Integer.toString(_game.getTarget()));
    	
    	String numbers = "";
    	boolean first = true;
    	for(int number: _game.getNumbers())
    	{
    		if(!first)
    			numbers += ", ";
    		first = false;
    		numbers = numbers + Integer.toString(number);
    	}
    	
    	_numbers.setText(numbers);
    	
    	checkSolution();
    }
    
    private double applyPlay(double[] numbers, OnePlay play)
    {
    	double a = numbers[play.getFirst()];
    	double b = numbers[play.getSecond()];
    	return Formattings.applyOperation(a, b, play.getOp());
    }
            
    private String _trace;
    private double _result;
    
    private void traceSolution()
    {
    	double[] numbers = new double[_game.getNumbers().length];
    	String[] printedNumbers = new String[_game.getNumbers().length]; 
    	for(int i=0; i<_game.getNumbers().length; i++)
    	{
    		numbers[i] = _game.getNumbers()[i];
    		printedNumbers[i] = Formattings.getPrintedNumber(numbers[i]);
    	}
    	
    	double result = 0.0;
    	StringBuilder sb = new StringBuilder();
    	for(OnePlay play: _game.getPlays())
    	{
    		result = applyPlay(numbers, play);
    		String printedResult = Formattings.getPrintedNumber(result);
    		
    		sb.append(String.format("%s %s %s = %s",
    				printedNumbers[play.getFirst()],
    				Formattings.getOpString(play.getOp()),
    				printedNumbers[play.getSecond()],
    				printedResult));
    		sb.append("\n");
    		
    		numbers[play.getFirst()] = result;
    		printedNumbers[play.getFirst()] = printedResult;
    		for(int i=play.getSecond(); i<numbers.length-1; i++)
    		{
    			numbers[i] = numbers[i+1];
    			printedNumbers[i] = printedNumbers[i+1];
    		}
    	}
    	
    	_result = result;
    	_trace = sb.toString();
    }
    
    private void checkSolution()
    {
    	traceSolution();
    	_progress.setText(_trace);
    	
    	if(Math.abs(_result - _game.getTarget())  < 1e-5)
    	{
    		setResult(RIGHT_RESULT);
    		_rightImage.setVisibility(View.VISIBLE);
    		_wrongText.setVisibility(View.GONE);
    		_close.setText(R.string.newgame);
    	}
    	else
    	{
    		setResult(WRONG_RESULT);
    		_rightImage.setVisibility(View.GONE);
    		_wrongText.setVisibility(View.VISIBLE);
    		_close.setText(R.string.tryagain);
    	}
    }
    
    public void onCloseClick(View btn)
    {
    	finish();
    }
}
