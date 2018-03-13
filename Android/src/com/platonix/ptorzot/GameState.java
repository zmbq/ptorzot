package com.platonix.ptorzot;

import java.util.ArrayList;
import java.util.List;

import android.os.Parcel;
import android.os.Parcelable;

import com.platonix.ptorzot.level.GameLevel;

public class GameState implements Parcelable 
{
	private int[] _numbers;
	private int _target;
	private List<OnePlay> _plays;
	private GameLevel _level;
	
	// The OnePlay class
	public static class OnePlay implements Parcelable
	{
		private double[] _numbersPre, _numbersPost;
		private int _first, _second;
		private char _op;
		
		public OnePlay(int first, int second, char op, GameState game, OnePlay previous)
		{			
			_first = first;
			_second = second;
			_op = op;
			checkPlay();
			
			if(previous==null)
			{
				_numbersPre = new double[game._numbers.length];
				for(int i=0; i<game._numbers.length; i++)
					_numbersPre[i] = game._numbers[i];
			}
			else
			{
				_numbersPre = new double[previous._numbersPost.length];
				System.arraycopy(previous._numbersPost,  0,  _numbersPre,  0, previous._numbersPost.length);
			}
			createNumbersPost();
		}
		
		private void checkPlay()
		{
			if(_op!='+' && _op!='-' && _op!='*' && _op!='/')
				throw new IllegalArgumentException("Op cannot be '" + _op + "'");
			
			if(_first<0 || _second<0 || _first==_second)
				throw new IllegalArgumentException("First and second must be non-negative and different");			
		}
		
		private void createNumbersPost()
		{
	    	double result = Formattings.applyOperation(_numbersPre[_first], _numbersPre[_second], _op);
	    	
	    	_numbersPost = new double[_numbersPre.length];
	    	System.arraycopy(_numbersPre, 0, _numbersPost, 0, _numbersPre.length);
	    	_numbersPost[_first] = result;
	    	for(int i=_second; i<_numbersPre.length-1; i++)
	    		_numbersPost[i] = _numbersPost[i+1];
		}
		
		public int getFirst() { return _first; }
		public int getSecond() { return _second;  }
		public char getOp() { return _op; }
		public double[] getNumbersPre() { return _numbersPre; }
		public double[] getNumbersPost() { return _numbersPost; }

		// Parcelable implementation
		public int describeContents() 
		{
			return 0;
		}

		public void writeToParcel(Parcel dest, int flags) 
		{
			dest.writeInt(_first);
			dest.writeInt(_second);
			dest.writeDoubleArray(_numbersPre);
			dest.writeDoubleArray(_numbersPost);
			dest.writeString(Character.toString(_op));
		}
		
		private OnePlay(Parcel in)
		{
			_first = in.readInt();
			_second = in.readInt();
			_numbersPre = in.createDoubleArray();
			_numbersPost = in.createDoubleArray();
			_op = in.readString().charAt(0);
			checkPlay();
		}
		
		public static final Parcelable.Creator<OnePlay> CREATOR = new Parcelable.Creator<OnePlay>()
		{
			public OnePlay createFromParcel(Parcel in)
			{
				return new OnePlay(in);
			}
			
			public OnePlay[] newArray(int size)
			{
				return new OnePlay[size];
			}
		};
	}

	// Properties
	public int[] getNumbers() { return _numbers; }
	public int getTarget() { return _target; }
	public List<OnePlay> getPlays() { return _plays; }
	public GameLevel getLevel() { return _level; }
	
	public GameState(GameLevel level, int [] numbers, int target)
	{
		if(numbers.length!=5)
			throw new IllegalArgumentException("Only 5 numbers are supported for now");
		
		_level = level;
		_numbers = numbers;
		_target = target;
		_plays = new ArrayList<OnePlay>();
	}
			
	// Parcelable implementation
	public int describeContents() 
	{
		return 0;
	}

	public void writeToParcel(Parcel dest, int flags) 
	{
		dest.writeInt(_level.getValue());
		dest.writeIntArray(_numbers);
		dest.writeInt(_target);
		dest.writeTypedList(_plays);
	}
	
	public static final Parcelable.Creator<GameState> CREATOR = new Parcelable.Creator<GameState>()
	{
		public GameState createFromParcel(Parcel source) 
		{
			return new GameState(source);
		}

		public GameState[] newArray(int size) 
		{
			return new GameState[size];
		}
	};
	
	private GameState(Parcel in)
	{
		_level = GameLevel.fromValue(in.readInt());
		_numbers = in.createIntArray();
		_target = in.readInt();
		_plays = new ArrayList<OnePlay>();
		in.readTypedList(_plays, OnePlay.CREATOR);	
	}
}
