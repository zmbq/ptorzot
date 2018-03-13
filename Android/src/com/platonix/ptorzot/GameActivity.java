package com.platonix.ptorzot;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Point;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Vibrator;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.ViewTreeObserver.OnGlobalLayoutListener;
import android.widget.AbsoluteLayout;
import android.widget.AbsoluteLayout.LayoutParams;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.platonix.ptorzot.GameState.OnePlay;
import com.platonix.ptorzot.level.GameLevel;

@SuppressWarnings("deprecation")
public class GameActivity extends Activity 
{
	// Child controls
	Button _numberButtons[];
	Button _opButtons[];
	
	TextView _targetView, _scratchPad;
	AbsoluteLayout _numbersPane;
	
	TextView _levelView;
	
	// The game
	GameState _game;
	
	// Button labels, to be compounded as the game goes on
	String [] _labels;
	
	// Shaking
	private SensorManager _SensorManager;
	private ShakeEventListener _SensorListener;
	
	// Vibrating
	private Vibrator _vibrator;
	
	// Handling
	private Handler _handler;


    @Override
    public void onCreate(Bundle savedInstanceState) 
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);
        
        _handler = new Handler();
        
        loadControls();
    	_labels = new String[5];
        if(savedInstanceState!=null)
        	readSavedInstanceState(savedInstanceState);
        else
        	createNewGame();
        
        ViewTreeObserver observer = _numbersPane.getViewTreeObserver();
        observer.addOnGlobalLayoutListener(new OnGlobalLayoutListener() 
        {
        	public void onGlobalLayout() 
        	{
				onLayoutComplete();
				_numbersPane.getViewTreeObserver().removeGlobalOnLayoutListener(this);
			}
		});
        
        _SensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        _SensorListener = new ShakeEventListener();   
        _SensorListener.setOnShakeListener(new ShakeEventListener.OnShakeListener() 
        {
        	public void onShake() 
        	{
        		startNewGame();
        	}
        });
        
        _vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        _levelView.setOnClickListener(new View.OnClickListener()
        {
        	public void onClick(View v)
        	{
        		onLevelClick();
        	}
        });
    }
    
    @Override
    public void onSaveInstanceState(Bundle bundle)
    {
    	super.onSaveInstanceState(bundle);
    	bundle.putParcelable("gameState", _game);
    	bundle.putStringArray("labels", _labels);
    }
    
    private void readSavedInstanceState(Bundle bundle)
    {
    	_game = bundle.getParcelable("gameState");
    	_labels = bundle.getStringArray("labels");
    }

    @Override
    protected void onResume() 
    {
    	super.onResume();
    	_SensorManager.registerListener(_SensorListener,
    			_SensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER),
    			SensorManager.SENSOR_DELAY_UI);
    }

    @Override
    protected void onPause() 
    {
    	_SensorManager.unregisterListener(_SensorListener);
    	super.onStop();
    }
    
    private void createNewGame()
    {
    	Settings settings = new Settings(this);
    	GameLevel level = settings.getDefaultLevel();
    	_game =  level.createNewGame();
    }
        
    private int activeButtonsNumber()
    {
    	return 5 - _game.getPlays().size();
    }
    
    private void onLayoutComplete()
    {
        initGameDisplay();
    	layoutNumberButtons();

    }
    
    private void initGameDisplay()
    {
    	_targetView.setText(Integer.toString(_game.getTarget()));
    	for(int i=0; i<5; i++)
    		_labels[i] = Integer.toString(_game.getNumbers()[i]);
    	
    	for(int i=0; i<_game.getPlays().size(); i++)
    		applyPlay(_game.getPlays().get(i), i);
    	
    	GameLevel level = _game.getLevel();
    	_levelView.setText(level.getLevelTextId());
    	_levelView.setCompoundDrawablesWithIntrinsicBounds(0, level.getLevelImageId(), 0, 0);
    	
    	startNewEntry();
    }
    
    private void applyPlay(OnePlay play, int playNum)
    {
    	_game.getLevel().getNextLabels(_labels, play);
    }
     
    private void loadControls()
    {
    	_numberButtons = new Button[5];
    	_numberButtons[0] = (Button)findViewById(R.id.button0);
    	_numberButtons[1] = (Button)findViewById(R.id.button1);
    	_numberButtons[2] = (Button)findViewById(R.id.button2);
    	_numberButtons[3] = (Button)findViewById(R.id.button3);
    	_numberButtons[4] = (Button)findViewById(R.id.button4);
    	
    	_opButtons = new Button[4];
    	_opButtons[0] = (Button)findViewById(R.id.op_add);
    	_opButtons[1] = (Button)findViewById(R.id.op_sub);
    	_opButtons[2] = (Button)findViewById(R.id.op_mult);
    	_opButtons[3] = (Button)findViewById(R.id.op_div);
    	
    	_targetView = (TextView)findViewById(R.id.target);
    	_scratchPad = (TextView)findViewById(R.id.scratch_pad);
    	_numbersPane = (AbsoluteLayout)findViewById(R.id.numbers_pane);
    	
    	_levelView = (TextView)findViewById(R.id.level);
    }
    
    private void layoutNumberButtons()
    {
    	layoutNumberButtons(activeButtonsNumber());
    }
    
    private void layoutNumberButtons(int numButtons)
    {
    	final int nums = numButtons;
		_handler.post(new Runnable() // Layout the numbers only after the buttons' content is updated 
		{
			
			@Override
			public void run() 
			{
				// Call the delayed method only after the UI gets sorted out
				delayedLayoutNumberButtons(nums);
			}
		});
    }
    
    private void delayedLayoutNumberButtons(int numButtons)
    {
    	Point total = new Point(_numbersPane.getMeasuredWidth(), _numbersPane.getMeasuredHeight());
    	Point center = new Point(total.x / 2, total.y / 2);
    	
    	setViewCenter(_targetView, center.x, center.y);
    	
    	double incAngle = Math.PI * 2 / numButtons;
    	double startAngle = -Math.PI;
    	double angle = startAngle;
    	double radius = Math.min(total.x, total.y) * 0.4;
    	for(int i=0; i<numButtons; i++)
    	{
    		double dx = radius * Math.sin(angle);
    		double dy = radius * Math.cos(angle);
    		setViewCenter(_numberButtons[i], center.x + (int)dx, center.y + (int)dy);
    		
    		angle += incAngle;
    	}
    }
    
    private void setViewCenter(View view, int x, int y)
    {
    	int height = view.getMeasuredHeight();
    	int width = view.getMeasuredWidth();
    	AbsoluteLayout.LayoutParams p = (LayoutParams) view.getLayoutParams();
    	p.x = x - width/2;
    	p.y = y - height/2;
    	view.setLayoutParams(p);
    }
    
    /* Handling user input */
    private void startNewEntry()
    {
    	_entryState = EntryState.Empty;
    	setScratchPadText();
    	for(int i=0; i<activeButtonsNumber(); i++)
    	{
    		_numberButtons[i].setText(_labels[i]);
    		_numberButtons[i].setEnabled(true);
    		_numberButtons[i].setVisibility(View.VISIBLE);
    	}
    	for(int i=activeButtonsNumber(); i<_numberButtons.length; i++)
    		_numberButtons[i].setVisibility(View.INVISIBLE);
    }
    
    enum EntryState
    {
    	Empty, FirstNumber, Operation, SecondNumber
    }
    private int _firstNumber, _secondNumber;
    private char _operation;
    private EntryState _entryState;

    private String parenthesize(String s) // Add parentheses around a compound expression
    {
    	if(s.length() < 3)
    		return s;
    	return "(" + s + ")";
    }
    
    private void setScratchPadText()
    {
    	String text = "";
    	
    	switch(_entryState)
    	{
    	case SecondNumber:
    		text = parenthesize(_labels[_secondNumber]);
    	case Operation:
    		text = " " + Formattings.getOpString(_operation) + " " + text;
    	case FirstNumber:
    		text = parenthesize(_labels[_firstNumber]) + text;
    	case Empty:
    		break;
    	}
    	
    	_scratchPad.setText(text);
    }
    
    public void onNumberClick(View btn)
    {
    	int btnIndex = Integer.parseInt(btn.getTag().toString());
    	
    	switch(_entryState)
    	{
    	case Empty:
    		_entryState = EntryState.FirstNumber;
    	case FirstNumber:
    		_firstNumber = btnIndex;
    		setScratchPadText();
    		break;
    	case Operation:
    		_entryState = EntryState.SecondNumber;
    	case SecondNumber:
			_secondNumber = btnIndex;
    		setScratchPadText();
    		nextPlay();
    		break;
    	}
    }
    
    public void onOperationClick(View btn)
    {
    	char op = btn.getTag().toString().charAt(0);
    	
    	switch(_entryState)
    	{
    	case Empty:
    		bzzzt();
    		break;
    	case FirstNumber:
    		_entryState = EntryState.Operation;
    		_numberButtons[_firstNumber].setEnabled(false);
    	case Operation:
    		_operation = op;
    		setScratchPadText();
    		break;
    	case SecondNumber:
    		bzzzt();
    		break;
    	}
    }
    
    private void bzzzt()
    {
    	if(_vibrator!=null)
    		_vibrator.vibrate(250);
    	else
    		Toast.makeText(this, "bzzzt", Toast.LENGTH_SHORT).show();
    }

    private int _backBzztCount = 0;
    @Override
	public void onBackPressed()
    {
    	switch(_entryState)
    	{
    	case SecondNumber:
    		_entryState = EntryState.Operation;
    		break;
    	case Operation:
    		_entryState = EntryState.FirstNumber;
    		_numberButtons[_firstNumber].setEnabled(true);
    		break;
    	case FirstNumber:
    		_entryState = EntryState.Empty;
    		break;
    	case Empty:
    		if(activeButtonsNumber() < 5)
    			prevPlay();
    		else
    		{
    			_backBzztCount++;
    			if(_backBzztCount > 2)
    			{
    				askIfExit();
    				_backBzztCount = 0;
    			}
    			else
    				bzzzt();
    		}
    	}
    	setScratchPadText();
    }
    
    private void askIfExit()
    {
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);
    	builder.setMessage(R.string.exit_game);
    	builder.setCancelable(false);
    	builder.setPositiveButton(R.string.yes,
    			new DialogInterface.OnClickListener() 
    			{
					@Override
					public void onClick(DialogInterface dialog, int which) 
					{
						GameActivity.this.finish();
					}
				});
    	builder.setNegativeButton(R.string.no, 
    			new DialogInterface.OnClickListener() 
    			{
					@Override
					public void onClick(DialogInterface dialog, int which) 
					{
						dialog.cancel();
					}
				});
    	AlertDialog alert = builder.create();
    	alert.show();
    }
    
    private void nextPlay()
    {
    	OnePlay last = _game.getPlays().isEmpty() ? null : _game.getPlays().get(_game.getPlays().size() - 1);
    	OnePlay play = new OnePlay(_firstNumber, _secondNumber, _operation, _game, last);
    	applyPlay(play, 5-activeButtonsNumber());
    	_game.getPlays().add(play);  // activeButtonsNumber is updated here
    	
    	if(activeButtonsNumber()==1)
    	{
    		_entryState = EntryState.Empty; // If the result is incorrect, prevPlay will be called. This assures it will work.
    		// See if the result is correct
    		Intent intent = new Intent(this, CheckResultActivity.class);
    		intent.putExtra("play", _game);
    		startActivityForResult(intent, 0);
    	}
    	else
    	{
    		layoutNumberButtons();
	    	startNewEntry();
    	}
    }
    
    private void prevPlay()
    {
    	OnePlay last = _game.getPlays().get(_game.getPlays().size()-1);
    	
    	_game.getPlays().remove(_game.getPlays().size() - 1);
    	initGameDisplay();
		layoutNumberButtons();
    	
    	_firstNumber = last.getFirst();
    	_secondNumber = last.getSecond();
    	_operation = last.getOp();
    	_entryState = EntryState.Operation;
    	_numberButtons[_firstNumber].setEnabled(false);
    	setScratchPadText();
    }
    
    private void startNewGame()
    {
    	createNewGame();
    	initGameDisplay();
    	layoutNumberButtons(activeButtonsNumber());
    }
    
    @Override
    protected void onActivityResult(int requestCode, int responseCode, Intent data)
    {
    	switch(responseCode)
    	{
    	case CheckResultActivity.RIGHT_RESULT:
    		startNewGame();
    		break;
    	case CheckResultActivity.WRONG_RESULT:
    		onBackPressed();
    		break;
    	}
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) 
    {
        getMenuInflater().inflate(R.menu.activity_game, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
    	switch(item.getItemId())
    	{
    	case R.id.menu_exit:
    		askIfExit();  // Finish()es the activity is the user wishes
    		return true;
    	case R.id.menu_new_game:
    		startNewGame();
    		return true;
    	}
    	
    	return super.onOptionsItemSelected(item);
    }
    
    // Levels - show a dialog allowing the user to choose the default level
    private void onLevelClick()
    {
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);
    	builder.setTitle(R.string.levels_title);
    	final Settings settings = new Settings(this);
    	int defaultLevel = settings.getDefaultLevel().getValue();
    	
    	String[] options = 
    	{ 
    		getResources().getString(GameLevel.Easy.getLevelLongTextId()),
    		getResources().getString(GameLevel.Medium.getLevelLongTextId()),
    		getResources().getString(GameLevel.Hard.getLevelLongTextId())
    	};
    	builder.setSingleChoiceItems(options, defaultLevel, null); 
    	builder.setPositiveButton(R.string.choose, new DialogInterface.OnClickListener() 
    	{
			@Override
			public void onClick(DialogInterface dialog, int which) 
			{
				int selectedPosition = ((AlertDialog)dialog).getListView().getCheckedItemPosition();
				settings.setDefaultLevel(GameLevel.fromValue(selectedPosition));
				dialog.dismiss();
				startNewGame();
			}
		});
    	builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() 
    	{
			
			@Override
			public void onClick(DialogInterface dialog, int which) 
			{
				dialog.dismiss();
			}
		});
    	builder.show();
    }
}
