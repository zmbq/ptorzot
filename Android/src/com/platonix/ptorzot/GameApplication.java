package com.platonix.ptorzot;

import android.app.Application;

public class GameApplication extends Application 
{
	public static GameApplication _theApp = null;
	
	@Override
	public void onCreate()
	{
		super.onCreate();
		Formattings.setApplication(this);
		_theApp = this;
	}
}
