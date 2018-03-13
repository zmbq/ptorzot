function rowAccess(row)
{
    this.number = row;
    this.result = undefined;
    this.activated = false;
    this.target = undefined;

    this.setNumber = function (col, value)
    {
        var formatted = formatNumber(value);

        this.lhs[col].data("exact_value", value);
        this.lhs[col].val(formatted);
        this.rhs[col].data("exact_value", value);
        this.rhs[col].val(formatted);
    }

    this.hide = function () { this.tr.hide(); }
    this.show = function () { this.tr.show(); }

    this.setButtonStyle = function (btn, style)
    {
        btn.removeClass(selectedClass);
        btn.removeClass(grayedClass);
        btn.removeClass(normalClass);
        btn.addClass(style);
        btn.removeAttr("disabled"); // Sometimes this gets added for no apparent reasons
    }

    this.getSelectedLhs = function ()
    {
        for (var i in this.lhs)
            if (this.lhs[i].hasClass(selectedClass))
                return this.lhs[i];
        return undefined;
    }

    this.getSelectedRhs = function ()
    {
        for (var i in this.rhs)
            if (this.rhs[i].hasClass(selectedClass))
                return this.rhs[i];
        return undefined;
    }

    this.getSelectedOp = function ()
    {
        for (var o in this.ops)
            if (this.ops[o].hasClass(selectedClass))
                return this.ops[o];
        return undefined;
    }

    this.calcResult = function (lhs, op, rhs)
    {
        var l = parseFloat(lhs.data("exact_value"));
        var r = parseFloat(rhs.data("exact_value"));
        switch (op.data("opCode"))
        {
            case "a":
                return l + r;

            case "s":
                return l - r;

            case "m":
                return l * r;

            case "d":
                return l / r;
        }
    }

    this.updateDesc = function ()
    {
        var str = "";
        var lhs = this.getSelectedLhs();
        str = str + (lhs ? formatNumber(lhs.val()) : "_");

        var op = this.getSelectedOp();
        str = str + " " + (op ? op.val() : "&middot;") + " ";

        var rhs = this.getSelectedRhs();
        str = str + (rhs ? formatNumber(rhs.val()) : "_");

        var done = false;
        if (lhs && op && rhs)
        {
            var result = this.calcResult(lhs, op, rhs);
            this.result = result;
            str = str + " = " + formatNumber(formatNumber(result));
            done = true;
        }
        else
            str = str + " = ?";

        if (done)
        {
            var ev = jQuery.Event("rowComplete", { "row": this });
            this.tr.trigger(ev);
        }

        this.desc.html(str);
    }

    this.reset = function ()
    {
        var i, o;

        for (i in this.lhs)
            this.setButtonStyle(this.lhs[i], normalClass);
        for (i in this.rhs)
            this.setButtonStyle(this.rhs[i], normalClass);
        for (o in this.ops)
            this.setButtonStyle(this.ops[o], normalClass);
        this.result = undefined;
        this.updateDesc();
    }

    this.selectLhs = function (index)
    {
        var rhsSelected = this.getSelectedRhs();

        for (var i = 1; i <= this.number; i++)
        {
            this.setButtonStyle(this.lhs[i], i == index ? selectedClass : grayedClass);
            if (!rhsSelected)
                this.setButtonStyle(this.rhs[i], i == index ? grayedClass : normalClass);
        }
        this.updateDesc();
    }

    this.onLhsClick = function ()
    {
        var self = $(this).data("rowAccess"); // This would have been `this` in any decent language
        if (!self.activated)  // This isn't an active line
            return;

        // We allow changing selection if this row is active

        var id = $(this).attr("id");
        var index = id.substr(id.length - 1);
        self.selectLhs(index);
        self.updateDesc();
    }

    this.selectRhs = function (index)
    {
        var lhsSelected = this.getSelectedLhs();

        for (var i = 1; i <= this.number; i++)
        {
            this.setButtonStyle(this.rhs[i], i == index ? selectedClass : grayedClass);
            if (!lhsSelected)
                this.setButtonStyle(this.lhs[i], i == index ? grayedClass : normalClass);
        }
    }

    this.onRhsClick = function ()
    {
        var self = $(this).data("rowAccess"); // This would have been `this` in any decent language
        if (!self.activated)  // This isn't an active line
            return;

        // We allow changing selection if this row is active

        var id = $(this).attr("id");
        var index = id.substr(id.length - 1);
        self.selectRhs(index);
        self.updateDesc();
    }

    this.selectOp = function (op)
    {
        for (var o in this.ops)
        {
            this.setButtonStyle(this.ops[o], op == o ? selectedClass : grayedClass);
        }
    }

    this.onOpClick = function ()
    {
        var self = $(this).data("rowAccess"); // This would have been `this` in any decent language
        if (!self.activated)  // This isn't an active line
            return;
        // We allow changing selection if this row is active

        var id = $(this).attr("id");
        var op = id.substr(id.length - 1);
        self.selectOp(op);
        self.updateDesc();
    }

    this.getSolverUrl = function ()
    {
        if (window.location.pathname.substr(0, 7) == "/static")
            return "/"; // Relevant when debugging with web.py as the main server
        return "solver/";
    }

    this.onAjaxError = function (jqHXR, textStatus, errorThrown)
    {
        $("#overlay").css("visibility", "hidden");
        alert("תקלה טכנית, נסו בעצמכם בינתיים");
    }

    this.onAjaxSuccess = function (data, textStatus, jqHXR)
    {
        $("#overlay").css("visibility", "hidden");
        if (!data.result)
            alert("לא ניתן להתקדם מכאן עד לפתרון");
        else
        {
            // data.result[0] is a in the form ((first, second), op)
            var first = data.result[0][0][0] + 1  // Data from the server is 0-based
            var second = data.result[0][0][1] + 1
            this.selectLhs(first);
            this.selectRhs(second);

            // Convert the operation (which is +, -, * or /) to our code - asmd
            var serverOps = "+-*/";
            var clientOps = "asmd";
            
            var op = serverOps.indexOf(data.result[0][1]);
            if (op >= 0)
                this.selectOp(clientOps.substr(op, 1));
            this.updateDesc();
        }
    }

    this.onHintClick = function ()
    {
        var self = $(this).data("rowAccess");

        $("#overlay").css("visibility", "visible");
        var url = self.getSolverUrl();
        url += "?numbers=";
        for (var i = 1; i <= self.number; i++)
        {
            url += self.lhs[i].data("exact_value");
            if (i < self.number)
                url += ",";
        }
        url += "&target=" + self.target;

        $.ajax(url,
            { "error": self.onAjaxError,
              "success": self.onAjaxSuccess,
              "dataType": "json",
              "crossDomain": true,
              "type": "GET",
              "context": self});
    }

    this.onCancelClick = function ()
    {
        var self = $(this).data("rowAccess");
        self.reset();
        var ev = jQuery.Event("rowReset", { "rowAccess": self });
        self.tr.trigger(ev);
    }

    this.initFromRowAbove = function (rowAbove)
    {
        var lhsOffset = rowAbove.getSelectedLhs().data("col");
        var rhsOffset = rowAbove.getSelectedRhs().data("col");
        var result = rowAbove.result;
        var offset = 0;

        this.reset();
        for (var i = 1; i <= rowAbove.number; i++)
        {
            if (i == lhsOffset)
                this.setNumber(i - offset, result);
            else if (i == rhsOffset)
                offset++;
            else
                this.setNumber(i - offset, rowAbove.lhs[i].data("exact_value"));
        }

        this.updateDesc();
    }

    this.activate = function ()
    {
        this.activated = true;
        this.tr.show();
        $(this.hint).css("visibility", "visible");
    }

    this.deactivate = function ()
    {
        this.activated = false;
        $(this.hint).css("visibility", "hidden");
    }

    /* Fill controls and hook events */
    this.lhs = {};
    this.rhs = {};
    this.ops = {};
    this.tr = $("tr#row" + this.number);

    this.desc = $("#desc" + row);
    this.cancel = $("#cancel" + row);
    this.hint = $("#hint" + row);

    for (var i = 1; i <= row; i++)
    {
        var lhs = $("#lhs" + row + "_" + i);
        lhs.data("rowAccess", this);
        lhs.data("col", i);
        lhs.on("click", this.onLhsClick);
        this.lhs[i] = lhs;

        var rhs = $("#rhs" + row + "_" + i);
        rhs.data("rowAccess", this);
        rhs.data("col", i);
        rhs.on("click", this.onRhsClick);
        this.rhs[i] = rhs;
    }

    var ops = "asmd";
    for (i = 0; i < ops.length; i++)
    {
        var op = $("#ops" + row + "_" + ops[i]);
        if (!op)  // No operations on row 1, don't bother with them
            break;
        op.data("rowAccess", this);
        op.data("opCode", ops[i]);
        op.on("click", this.onOpClick);
        this.ops[ops[i]] = op;
    }

    this.cancel.data("rowAccess", this);
    this.cancel.on("click", this.onCancelClick);

    this.hint.data("rowAccess", this);
    this.hint.on("click", this.onHintClick);

    /* Start up clean */
    this.reset();
}
