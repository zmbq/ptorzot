/* Provide encapsulations of the UI design. */

/*
selectedClass = "selected";
grayedClass = "grayed";
normalClass = "normal"; */

selectedClass = "btn-success";
grayedClass = "btn-grayed";  // This class doesn't really exist
normalClass = "btn-inverse";


formatNumber = function (n)
{
    if (n == Math.floor(n))
        return n;
    else
    {
        s = parseFloat(n).toFixed(2);
        if (s.substr(s.length - 3) == ".00")
            return n;
        return s;
    }
}