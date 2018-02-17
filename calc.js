// Bc. Adam Bezák xbezak01
// WAP - Tabulkovy kalkulator

// Vytvorenie tabulky
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
            td.appendChild(document.createTextNode(getRandomInt(0, 10)));
        }
    }
    body.appendChild(table);

    // Nastavenie handlerov na elementy tabulky
    function setupHandlers() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            all[i].onclick = inputClickHandler;
            all[i].ondblclick = inputDoubleClickHandler;
            all[i].onfocusout = inputFocusOutHandler;
        }
    }

    // Skrytie oznacenych buniek mysou
    function hideHighlightedCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('selected')) {
                all[i].classList.remove('selected');               
            }
        }
    }

    // Skrytie a vymazanie hodnot oznacenych buniek
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

    // Odznacenie aktualnej focusnutej bunky
    function deselectCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('focused')) {
                all[i].classList.remove('focused');
                all[i].removeAttribute('contenteditable');
            }
        }
    }

    // Prepocitanie tabulky
    function recomputeTable() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            var tdElm = all[i];
            if (tdElm.hasAttribute('expression')) {
                var expr = tdElm.getAttribute("expression");
                if (expr != "") {
                    //SUM
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

                    //AVG
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

                    //Vyraz
                    n = expr.search("=[0-9+\\-\\*\\/\\(\\)\\^]*");
                    if (n != 0) {
                        tdElm.innerHTML = "Err";
                    } else {
                        var sub = expr.substr(1, expr.length-1);
                        try {
                            var val = eval('(' + sub + ')') || "Err";
                        } catch(err) {
                            tdElm.innerHTML = "err";
                        }
                        tdElm.innerHTML = val;
                    }                    
                }
            }
        }
    }

    // Doubleclick na bunku
    function inputDoubleClickHandler(e) {
        e = e || window.event;
        var tdElm = e.target||e.srcElement;
        if(tdElm.classList.contains('selectedAndDoubleClicked')) {
            tdElm.classList.remove('selectedAndDoubleClicked');
        } else {
            tdElm.classList.add('selectedAndDoubleClicked');
        }
    }

    // Click na bunku
    function inputClickHandler(e) {
        e = e || window.event;
        var tdElm = e.target || e.srcElement;
        if (tdElm.getAttribute('expression') != "") {
            if (!(tdElm.classList.contains('focused'))) {
                tdElm.innerHTML = tdElm.getAttribute('expression');
            }
        }
        hideHighlightedCells();
        deselectCells();
        tdElm.classList.add('focused');
        tdElm.setAttribute('contenteditable', 'true');
        tdElm.focus();
    }

    // Ak bunka stratila focus
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

    // Stlacenie klavesnice
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

    // Vybranie dalsej bunky ktora bude focusnuta
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

    // Zistenie dalsieho indexu focusnutej bunky
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

    // Oznacenie buniek mysou
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

        // Na zaklade pociatocneho a koncoveho indexu vyznacim bunky
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

//Generovanie random cisel
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
