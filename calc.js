// Bc. Adam Bezák xbezak01
// WAP - Tabulkovy kalkulator

function tableCreate(rowCount, colCount, tableId){
    var body = document.body,
        table  = document.createElement('table');
    table.classList.add(tableId);
    table.setAttribute("tabindex", 0);

    for(var i = 0; i < rowCount; i++){
        var tr = table.insertRow();
        for(var j = 0; j < colCount; j++){
            var td = tr.insertCell();
            td.setAttribute("id",  tableId+"_"+i.toString()+"_"+j.toString());
            td.setAttribute("expression", "");
            td.appendChild(document.createTextNode(''));
        }
    }
    body.appendChild(table);

    function setupHandlers() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            all[i].onclick = inputClickHandler;
            all[i].ondblclick = inputDoubleClickHandler;
            all[i].onfocusout = inputFocusOutHandler;
        }
    }

    function hideHighlightedCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('selected')) {
                all[i].classList.remove('selected');               
            }
        }
    }

    function deleteAndHideHighlightedCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('selected')) {
                all[i].innerHTML = "";
                all[i].setAttribute("expression", "");
                all[i].classList.remove('selected');               
            }
        }        
    }

    function deselectCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('focused')) {
                all[i].classList.remove('focused');
                all[i].removeAttribute('contenteditable');
            }
        }
    }

    function recomputeTable() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            var tdElm = all[i];
            if (tdElm.hasAttribute('expression')) {
                var expr = tdElm.getAttribute("expression");
                if (expr != "") {
                    var n = expr.search("=(sum|SUM)\\([0-9,\\_]*");
                    if (n == 0) {
                        var values = expr.match(/[0-9]*_[0-9]*/g);
                        var total = 0;
                        for (var x = 0; x < values.length; x++) { 
                            var val = document.getElementById(tableId+"_"+values[x]);
                            total = total + parseInt(val.innerHTML,10);
                        }
                        tdElm.innerHTML = total.toString(10);
                        continue;
                    }
                    n = expr.search("=(AVG|avg)\\([0-9,\\_]*");
                    if (n == 0) {
                        var values = expr.match(/[0-9]*_[0-9]*/g);
                        var total = 0;
                        for (var x = 0; x < values.length; x++) {
                            var val = document.getElementById(tableId+"_"+values[x]);
                            total = total + parseInt(val.innerHTML,10);
                        }
                        total = total / values.length;
                        tdElm.innerHTML = total.toString(10);
                        continue;;
                    }
                    n = expr.search("=[0-9+\\-\\*\\/\\(\\)\\^]*");
                    if (n != 0) {
                        tdElm.innerHTML = "Err";
                    } else {
                        var sub = expr.substr(1, expr.length-1);
                        var val = eval('(' + sub + ')') || "Err";
                        tdElm.innerHTML = val;
                    }                    
                }
            }
        }
    }

    function inputDoubleClickHandler(e) {
        e = e || window.event;
        var tdElm = e.target||e.srcElement;
        if(tdElm.classList.contains('selectedAndDoubleClicked')) {
            tdElm.classList.remove('selectedAndDoubleClicked');
        } else {
            tdElm.classList.add('selectedAndDoubleClicked');
        }
    }

    function inputClickHandler(e) {
        hideHighlightedCells();
        deselectCells();
        e = e || window.event;
        var tdElm = e.target || e.srcElement;
        tdElm.classList.add('focused');
        tdElm.setAttribute('contenteditable', 'true');
        if (tdElm.getAttribute('expression') != "") {
            tdElm.innerHTML = tdElm.getAttribute('expression');
        }
        tdElm.focus();
    }

    function inputFocusOutHandler(e) {
        e = e || window.event;
        var tdElm = e.target || e.srcElement;
        var value = tdElm.innerHTML;

        if (value.length > 0) {
            if (value.charAt(0) == '=') {
                tdElm.setAttribute('expression', value);
            } else {
                tdElm.setAttribute('expression', "");
            }
        }

        recomputeTable();
    }

    function checkKey(e) {
        e = e || window.event;
        var index = null

        switch (e.keyCode) {
            case 38:
                index = getNextTableCellIndex('up');
                break;
            case 40:
                index = getNextTableCellIndex('down');
                break;
            case 37:
                index = getNextTableCellIndex('left');
                break;
            case 39:
                index = getNextTableCellIndex('right');
                break;
            default:
                return;
        }

        selectNextTableCell(index)
    }

    function selectNextTableCell(index) {
        try {
            var tdElm = table.rows[index[0]].cells[index[1]];
        } catch(e) {
            //TODO handle exception
            console.log(e.name);
            return;
        }
        if (tdElm == null) {
            console.log('out of table');
            return;
        }
        deselectCells();
        tdElm.classList.add('focused');
        tdElm.setAttribute('contenteditable', 'true');
        //FIXME not working
        if (tdElm.getAttribute('expression') != "") {
            var expression = tdElm.getAttribute('expression');
            tdElm.innerHTML = expression;
        }
        tdElm.focus();
    }

    function getNextTableCellIndex(arrow) {
        var tdElm = table.getElementsByClassName('focused')[0];
        var rowIndex = tdElm.closest('tr').rowIndex;
        var colIndex = tdElm.closest('td').cellIndex;
        var index = [];

        switch (arrow) {
            case 'up':
                index = [rowIndex - 1, colIndex];
                break;
            case 'down':
                index = [rowIndex + 1, colIndex];
                break;
            case 'left':
                index = [rowIndex, colIndex - 1];
                break;
            case 'right':
                index = [rowIndex, colIndex + 1];
                break;
            default:
                console.log('err');
        }

        return index;
    }

    function selectingCells() {
        var isMouseDown = false;
        var startRowIndex = null;
        var startCellIndex = null;
        var lastRowIndex = null;
        var lastCellIndex = null;
        var endRowIndex = null;
        var endCellIndex = null;
        table.addEventListener('mousedown', function(e) {
            isMouseDown = true;
            startRowIndex = e.target.parentElement.rowIndex;
            startCellIndex = e.target.cellIndex;
        })

        table.addEventListener('mousemove', function(e) {
            if (isMouseDown) {
                endRowIndex = e.target.parentElement.rowIndex;
                endCellIndex = e.target.cellIndex;
                if ((startRowIndex != endRowIndex && lastRowIndex != endRowIndex) || (startCellIndex != endCellIndex && lastCellIndex != endCellIndex)) {
                    lastRowIndex = endRowIndex;
                    lastCellIndex = endCellIndex;
                    hideHighlightedCells();
                    calculateSelection();
                }
            }
        })

        table.addEventListener('mouseup', function(e) {
            if (isMouseDown) {
                endRowIndex = e.target.parentElement.rowIndex;
                endCellIndex = e.target.cellIndex;
                if ((startRowIndex != endRowIndex) || (startCellIndex != endCellIndex)) {
                    calculateSelection();
                }
            }
            isMouseDown = false;
        })

        table.addEventListener('keydown', function(e) {
            if (e.keyCode == 8) {
                deleteAndHideHighlightedCells();
            }
        })

        function calculateSelection() {
            var rowStart, rowEnd, cellStart, cellEnd;
            
            if (endRowIndex < startRowIndex) {
                rowStart = endRowIndex;
                rowEnd = startRowIndex;
            } else {
                rowStart = startRowIndex;
                rowEnd = endRowIndex;
            }
            
            if (endCellIndex < startCellIndex) {
                cellStart = endCellIndex;
                cellEnd = startCellIndex;
            } else {
                cellStart = startCellIndex;
                cellEnd = endCellIndex;
            }
            for (var i = rowStart; i <= rowEnd; i++) {
                for (var j = cellStart; j <= cellEnd; j++) {
                    var tdElm = table.rows[i].cells[j];
                    tdElm.classList.add('selected');
                }        
            }
        }
    }

    setupHandlers();
    selectingCells();
    table.onkeydown = checkKey;
}