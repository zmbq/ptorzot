package com.platonix.ptorzot;

import java.lang.ref.WeakReference;

import com.platonix.ptorzot.level.GameLevel;

import android.app.Activity;
import android.content.SharedPreferences;

public class Settings 
{
	private WeakReference<Activity> _activity;
	private static final String LEVEL="default.level";
	
	public Settings(Activity activity)
	{
		_activity = new WeakReference<Activity>(activity);
	}
	
	private SharedPreferences getPrefs()
	{
		return _activity.get().getPreferences(Activity.MODE_PRIVATE);
	}
	
	public GameLevel getDefaultLevel()
	{
		return GameLevel.fromValue(getPrefs().getInt(LEVEL, 1));
	}
	
	public void setDefaultLevel(GameLevel level)
	{
		SharedPreferences.Editor editor = getPrefs().edit();
		editor.putInt(LEVEL, level.getValue());
		editor.commit();
	}
}
