# PtorZot Android App - Existing Architecture

## Overview
PtorZot (פתור זאת - "Solve This" in Hebrew) is an Android mathematical puzzle game where players must reach a target number by performing arithmetic operations on a set of given numbers. The game guarantees a solution exists for every puzzle.

## Core Game Mechanics
- **Objective**: Reach a target number using 5 given numbers and 4 operations (+, -, ×, ÷)
- **Gameplay**: Players select two numbers and an operation; the result replaces one number and removes the other, continuing until one number remains
- **Validation**: The game checks if the final result matches the target
- **Difficulty Levels**: Easy, Medium, Hard (different target ranges and display modes)

---

## Architecture Components

### 1. Application Layer

#### **GameApplication** (`GameApplication.java`)
- **Type**: Application singleton
- **Responsibilities**:
  - Application lifecycle management
  - Global initialization of the `Formattings` utility
  - Provides global application context
- **Dependencies**: None
- **Used by**: All activities

---

### 2. Activities (UI Layer)

#### **GameActivity** (`GameActivity.java`)
- **Type**: Main activity (game screen)
- **Responsibilities**:
  - Main game UI orchestration
  - User input handling (number/operation selection)
  - Dynamic button layout in circular pattern around target
  - Entry state machine management
  - Integration with device sensors (shake to restart)
  - Navigation to result checking
  - Menu handling (new game, exit, level selection)
- **Key Features**:
  - **Circular Layout**: Positions number buttons in a circle around the target using trigonometry
  - **State Machine**: Tracks entry progress (Empty → FirstNumber → Operation → SecondNumber)
  - **Shake Detection**: Uses accelerometer to detect shake gesture for new game
  - **Back Navigation**: Multi-level undo support
  - **Haptic Feedback**: Vibrates on invalid actions
- **UI Components**:
  - 5 number buttons (dynamic positioning)
  - 4 operation buttons (+, -, ×, ÷)
  - Target display (center)
  - Scratch pad (shows current expression)
  - Level indicator (with icon and text)
- **Dependencies**: GameState, GameLevel, Settings, ShakeEventListener

#### **CheckResultActivity** (`CheckResultActivity.java`)
- **Type**: Result validation activity
- **Responsibilities**:
  - Validates player's solution
  - Displays step-by-step calculation trace
  - Shows success/failure feedback
  - Returns result to GameActivity
- **UI Components**:
  - Target number display
  - Original numbers display
  - Calculation trace (all steps)
  - Success image or error text
  - Action button (New Game/Try Again)
- **Return Codes**:
  - `RIGHT_RESULT`: Solution is correct
  - `WRONG_RESULT`: Solution is incorrect
- **Dependencies**: GameState, Formattings

---

### 3. Game Logic Layer

#### **GameState** (`GameState.java`)
- **Type**: Core data model (Parcelable)
- **Responsibilities**:
  - Stores complete game state
  - Manages the list of plays
  - Persists across configuration changes
- **Properties**:
  - `numbers[]`: The 5 initial numbers
  - `target`: The goal number
  - `plays`: List of OnePlay objects
  - `level`: Current difficulty level
- **Features**:
  - Implements `Parcelable` for state preservation during screen rotation
  - Immutable number and target values
  - Mutable play history

#### **GameState.OnePlay** (`GameState.java` inner class)
- **Type**: Data model (Parcelable)
- **Responsibilities**:
  - Represents a single operation
  - Tracks before/after state of numbers
  - Validates operation legality
- **Properties**:
  - `first`, `second`: Indices of selected numbers
  - `op`: Operation character (+, -, *, /)
  - `numbersPre[]`: Number array before operation
  - `numbersPost[]`: Number array after operation
- **Features**:
  - Self-validating (checks operation validity)
  - Calculates result automatically
  - Implements `Parcelable` for state preservation

---

### 4. Level System

#### **GameLevel** (`level/GameLevel.java`)
- **Type**: Abstract base class
- **Responsibilities**:
  - Defines level contract
  - Implements solvable puzzle generation algorithm
  - Provides level metadata (images, text resources)
- **Algorithm**:
  - Generates 5 random numbers (1-9)
  - Performs random operations to find a valid target
  - Ensures target is an integer within level range
  - Retries up to 1000 iterations
- **Abstract Methods**:
  - `createNewGame()`: Instantiates a game with appropriate target range
  - `getNextLabels()`: Determines how labels update after each play
- **Static Instances**: Easy, Medium, Hard
- **Factory Method**: `fromValue(int)` for deserialization

#### **EasyLevel** (`level/EasyLevel.java`)
- **Target Range**: 11-40
- **Label Display**: Shows only numeric results
- **Visual Indicator**: Green icon
- **Text**: "קל" (Easy)

#### **MediumLevel** (`level/MediumLevel.java`)
- **Target Range**: 19-60
- **Label Display**: Shows full expression with parentheses (e.g., "(3 + 5) × 2")
- **Visual Indicator**: Yellow icon
- **Text**: "בינוני" (Medium)

#### **HardLevel** (`level/HardLevel.java`)
- **Target Range**: 60-120
- **Label Display**: Shows full expression with parentheses
- **Visual Indicator**: Red icon
- **Text**: "קשה" (Hard)

---

### 5. Utility Classes

#### **Formattings** (`Formattings.java`)
- **Type**: Static utility class
- **Responsibilities**:
  - Operation symbol formatting (localized: +, -, ×, ÷)
  - Number formatting (integer vs decimal display)
  - Operation calculation
- **Methods**:
  - `getOpString(char)`: Returns localized operation symbol
  - `getPrintedNumber(double)`: Formats number (rounds if near-integer)
  - `applyOperation(a, b, op)`: Performs arithmetic calculation
- **Dependencies**: GameApplication (for string resources)

#### **Settings** (`Settings.java`)
- **Type**: Preferences wrapper
- **Responsibilities**:
  - Persists user preferences
  - Manages default difficulty level
- **Storage**: Android SharedPreferences
- **Methods**:
  - `getDefaultLevel()`: Retrieves saved level (default: Medium)
  - `setDefaultLevel(level)`: Saves level preference
- **Dependencies**: Activity context

#### **ShakeEventListener** (`ShakeEventListener.java`)
- **Type**: Sensor event listener
- **Responsibilities**:
  - Detects shake gestures using accelerometer
  - Filters false positives
- **Algorithm**:
  - Monitors accelerometer changes
  - Requires minimum force and direction changes
  - Enforces timing constraints (max pause, max total duration)
- **Callback**: `OnShakeListener.onShake()`
- **Source**: Stack Overflow implementation

---

## Data Flow

### Game Initialization Flow
```
1. GameActivity.onCreate()
2. → Settings.getDefaultLevel()
3. → GameLevel.createNewGame()
4. → GameState constructor (with random numbers & solvable target)
5. → UI initialization (load controls, layout buttons)
```

### User Input Flow
```
1. User taps number button
2. → GameActivity.onNumberClick()
3. → Update entry state machine
4. → Update scratch pad display
5. (If second number) → Create OnePlay
6. → Update GameState.plays list
7. → GameLevel.getNextLabels() (update button text)
8. → Re-layout remaining buttons
9. (If final number) → Launch CheckResultActivity
```

### Result Validation Flow
```
1. CheckResultActivity.onCreate()
2. → Receive GameState from intent
3. → traceSolution() (replay all operations)
4. → Compare final result with target (within epsilon)
5. → Display trace and success/failure UI
6. → Return result code to GameActivity
7. → GameActivity: Start new game or undo last play
```

### Shake Gesture Flow
```
1. Accelerometer detects motion
2. → ShakeEventListener.onSensorChanged()
3. → Analyze force and timing
4. → OnShakeListener.onShake() callback
5. → GameActivity.startNewGame()
6. → Create new GameState and reset UI
```

---

## State Management

### Entry State Machine
The game tracks user input through four states:

- **Empty**: No selection made
- **FirstNumber**: First number selected
- **Operation**: Operation selected (first number disabled)
- **SecondNumber**: Second number selected (completes play)

### Back Button Behavior
- **SecondNumber** → Operation (clear second number)
- **Operation** → FirstNumber (re-enable first number)
- **FirstNumber** → Empty
- **Empty** → Undo last play (if any), else prompt to exit

### State Persistence
- GameState and OnePlay implement `Parcelable`
- Saved/restored via `onSaveInstanceState()`/`onCreate()`
- Handles screen rotation and process termination

---

## UI Patterns

### Layout Strategy
- **Portrait/Landscape Adaptive**: AbsoluteLayout with dynamic positioning
- **Circular Button Layout**: Number buttons arranged in a circle around target
  - Calculated using trigonometry (sin/cos)
  - Center point: middle of numbers pane
  - Radius: 40% of minimum dimension
- **Responsive Sizing**: Handler-based delayed layout after text updates

### Visual Feedback
- **Haptic**: Vibration on invalid actions
- **Visual**: Button disabling, scratch pad updates
- **Color Coding**: Green (Easy), Yellow (Medium), Red (Hard)
- **Icons**: Level indicators with drawable resources

### Localization
- **Language**: Hebrew (RTL)
- **String Resources**: All text externalized
- **Operation Symbols**: Unicode characters (×, ÷)

---

## Platform-Specific Features

### Android APIs Used
- **SensorManager**: Accelerometer for shake detection
- **Vibrator**: Haptic feedback
- **SharedPreferences**: Settings persistence
- **Parcelable**: State serialization
- **Handler**: UI thread posting
- **AlertDialog**: Level selection and exit confirmation
- **ViewTreeObserver**: Layout completion detection

### Permissions
- None explicitly required (vibration is normal permission)

### Build Configuration
- **Target SDK**: API level not specified in provided files
- **Support Library**: android-support-v4.jar
- **ProGuard**: Configuration present

---

## Asset Resources

### Drawables
- **Backgrounds**: `old_mathematics.png`
- **Title**: `title.png`
- **Level Icons**: `green.png`, `yellow.png`, `red.png`
- **Success Image**: `nachonmeod.png`
- **Shape**: `rectangle.xml` (border drawable)
- **Launcher Icons**: Multiple densities (ldpi, mdpi, hdpi, xhdpi)

### Layouts
- **activity_game.xml**: Main game screen
  - LinearLayout root with background
  - Title image
  - Scratch pad + level indicator
  - AbsoluteLayout for number buttons (dynamic positioning)
  - Operation buttons row
- **activity_check_result.xml**: Result validation screen
  - LinearLayout root with background
  - Target and numbers display
  - Calculation trace
  - Success image or error text
  - Close button

### Styles
- **NumberButton**: Rounded buttons, 12pt text, centered
- **OpButton**: Equal-width buttons (25% each), 14pt text
- **bordered**: Rectangle background for scratch pad
- **ResultText**: 10pt text for result screen

---

## Testing & Quality

### Current State
- No unit tests found in provided structure
- No UI automation tests found
- Manual testing implied

### Potential Issues
- **Deprecated APIs**: AbsoluteLayout (deprecated since API 3)
- **Hardcoded Values**: Magic numbers for layout calculations
- **No Error Handling**: Assumes happy path in many places
- **Language Lock**: Only Hebrew supported (no i18n framework)

---

## Dependencies

### External Libraries
- **android-support-v4.jar**: Compatibility support

### Internal Dependencies Graph
```
GameActivity
  ├── GameState
  │   ├── GameLevel (Easy/Medium/Hard)
  │   └── OnePlay
  ├── Settings
  ├── ShakeEventListener
  ├── Formattings
  └── CheckResultActivity
      ├── GameState
      └── Formattings

GameApplication
  └── Formattings
```

---

## Summary

### Strengths
✅ Clean separation of concerns (UI, logic, data)  
✅ Robust state management with Parcelable  
✅ Elegant circular layout algorithm  
✅ Guaranteed solvable puzzles  
✅ Multi-level undo support  
✅ Responsive to configuration changes  

### Weaknesses
❌ Uses deprecated AbsoluteLayout  
❌ Single language support (Hebrew only)  
❌ No automated tests  
❌ Tight coupling to Android framework  
❌ No separation of business logic from Android classes  
❌ Magic numbers in code  

### Architecture Pattern
**Model-View-Presenter (MVP) hybrid** with Android Activities serving as both View and Presenter.

---

## Conversion Considerations for PWA

When converting to a PWA, the following components should be preserved:
1. **Core Game Logic**: GameState, OnePlay, operation calculations
2. **Level System**: Three difficulty levels with generation algorithms
3. **UI Layout**: Circular button arrangement, scratch pad display
4. **State Management**: Undo/redo capability, state persistence
5. **User Experience**: Shake to restart (using DeviceMotion API), haptic feedback

Components that need replacement:
1. **Activities** → Web components/views
2. **Parcelable** → JSON serialization or state management library
3. **SharedPreferences** → localStorage or IndexedDB
4. **Android resources** → CSS, image files, i18n libraries
5. **SensorManager** → DeviceMotionEvent API
6. **Vibrator** → Navigator.vibrate() API
