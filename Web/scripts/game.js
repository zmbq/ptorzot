var target = 0;
var numbers = [];
var rows = {};
var lastRow;

function generateExercise()
{
    target = Math.floor(Math.random() * 99);
    numbers = []
    for (var i = 0; i < 5; i++) {
        var number = Math.floor(Math.random() * 9) + 1;
        numbers.push(number);
    }
}

function onRowComplete(ev)
{
    if (lastRow > 2)
    {
        rows[lastRow].deactivate();
        lastRow--;
        rows[lastRow].initFromRowAbove(rows[lastRow + 1]);
        rows[lastRow].activate();
    }
    else if (Math.abs(rows[2].result - target) < 1e-4)  // Take rounding errors into account
    {
        rows[lastRow].deactivate();
        $("#result_row").show();
    }
}

function onRowReset(ev)
{
    var rowNum = ev.rowAccess.number;

    for (var i = rowNum - 1; i >= 2; i--)
        rows[i].hide();
    $("#result_row").hide();

    lastRow = rowNum;
    rows[lastRow].activate();
}

function initRows()
{
    for (var i = 2; i <= 5; i++)
    {
        rows[i] = new rowAccess(i);
        rows[i].tr.on("rowComplete", onRowComplete);
        rows[i].tr.on("rowReset", onRowReset);
    }
}

function initDisplay()
{
    $("#target").text(target);
    $("#numbers").text(numbers.join(", "));

    for (var line = 4; line >= 2; line--)
    {
        rows[line].hide();
        rows[line].target = target;
    }
    $("#result_row").hide();

    for(var number=1; number<=5; number++)
        rows[5].setNumber(number, numbers[number - 1]);
    rows[5].target = target;
    rows[5].reset();
    rows[5].activate();
    lastRow = 5;
}

function onReady()
{
    initRows();
    generateExercise();
    initDisplay();
}

function onNewGame()
{
    generateExercise();
    initDisplay();
}

$(document).ready(onReady);