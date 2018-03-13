package com.platonix.ptorzot;

import android.annotation.SuppressLint;

public class Formattings 
{
	private static GameApplication _gameApp;
	
	public static void setApplication(GameApplication game)
	{
		_gameApp = game;
	}
	
	public static String getOpString(char op)
	{
    	switch(op)
    	{
    	case '+':
    		return _gameApp.getString(R.string.plus);
    	case '-':
    		return _gameApp.getString(R.string.minus);
    	case '*':
    		return _gameApp.getString(R.string.times);
    	case '/':
    		return _gameApp.getString(R.string.divide);
   		default:
   			return "?";
    	}
	}

    @SuppressLint("DefaultLocale") 
    public static String getPrintedNumber(double n)
    {
    	if(Math.abs(Math.round(n) - n) < 1e-5)  // This is a whole number (with rounding errors)
    		return String.format("%.0f", n);
    	
    	return String.format("%.02f", n);
    }

    public static double applyOperation(double a, double b, char op)
    {
    	switch(op)
    	{
    	case '+': return a+b;
    	case '-': return a-b;
    	case '*': return a*b;
    	case '/': return a/b;
    	default: return 0;
    	}
    }
}
