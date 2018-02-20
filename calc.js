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
            var div = document.createElement('div');
            div.setAttribute("id", tableId+"_"+i.toString()+"_"+j.toString());
            div.setAttribute("expression", "");
            div.style.height = '100%';
            div.className = 'tdDiv';
            div.innerHTML = getRandomInt(0, 10);
            td.appendChild(div);
        }
    }
    body.appendChild(table);

    // Nastavenie handlerov na elementy tabulky
    function setupHandlers() {
        var all = table.getElementsByTagName("div");
        for (var i=0;i<all.length;i++) {
            all[i].onclick = inputClickHandler;
            all[i].ondblclick = inputDoubleClickHandler;
        }
    }

    // Nastavenie listenerov na tabulku
    function setupListeners() {
        table.addEventListener('keydown', function(e) {
            if (e.keyCode == 8) {
                deleteAndHideHighlightedCells();
            }
        })

        table.addEventListener('focusout', function(e) {
            inputFocusOutHandler(e);
        })
    }

    // Skrytie oznacenych buniek mysou
    function hideHighlightedCells() {
        var all = table.getElementsByTagName("div");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('selected')) {
                all[i].classList.remove('selected');               
            }
        }
    }

    // Skrytie a vymazanie hodnot oznacenych buniek
    function deleteAndHideHighlightedCells() {
        var all = table.getElementsByTagName("div");
        var somethingDeleted = false
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('selected')) {
                all[i].innerHTML = "";
                all[i].setAttribute("expression", "");
                all[i].classList.remove('selected');
                somethingDeleted = true            
            }
        }
        if (somethingDeleted) {
            recomputeTable();
        }
    }

    // Odznacenie aktualnej focusnutej bunky
    function deselectCells() {
        var all = table.getElementsByTagName("div");
        for (var i=0;i<all.length;i++) {
            if (all[i].classList.contains('focused')) {
                all[i].classList.remove('focused');
                all[i].removeAttribute('contenteditable');
            }
        }
    }

    // Prepocitanie tabulky
    function recomputeTable() {
        var all = table.getElementsByTagName("div");
        for (var i=0;i<all.length;i++) {
            var tdDiv = all[i];
            if (tdDiv.hasAttribute('expression')) {
                var expr = tdDiv.getAttribute("expression");
                if (expr != "") {
                    //SUM
                    var n = expr.search("=(sum|SUM)\\([0-9,\\_]*");
                    if (n == 0) {
                        var values = expr.match(/[0-9]*_[0-9]*/g);
                        var total = 0;
                        try {
                            for (var x = 0; x < values.length; x++) { 
                                var val = document.getElementById(tableId+"_"+values[x]);
                                total = total + parseInt(val.innerHTML,10);
                            }
                        } catch(err) {
                            tdDiv.innerHTML = "err";
                            continue                           
                        }
                        tdDiv.innerHTML = total.toString(10);
                        continue;
                    }

                    //AVG
                    n = expr.search("=(AVG|avg)\\([0-9,\\_]*");
                    if (n == 0) {
                        var values = expr.match(/[0-9]*_[0-9]*/g);
                        var total = 0;
                        try {
                            for (var x = 0; x < values.length; x++) {
                                var val = document.getElementById(tableId+"_"+values[x]);
                                total = total + parseInt(val.innerHTML,10);
                            }                
                        } catch(err) {
                            tdDiv.innerHTML = "err";
                            continue
                        }
                        total = total / values.length;
                        tdDiv.innerHTML = total.toString(10);
                        continue;;
                    }

                    //Vyraz
                    n = expr.search("=[0-9+\\-\\*\\/\\(\\)\\^]*");
                    if (n != 0) {
                        tdDiv.innerHTML = "Err";
                    } else {
                        var sub = expr.substr(1, expr.length-1);
                        try {
                            var val = eval(sub) || "Err";
                        } catch(err) {
                            tdDiv.innerHTML = "err";
                            continue;
                        }
                        tdDiv.innerHTML = val;
                    }                    
                }
            }
        }
    }

    // Doubleclick na bunku
    function inputDoubleClickHandler(e) {
        e = e || window.event;
        var tdDiv = e.target||e.srcElement;
        if(tdDiv.classList.contains('selectedAndDoubleClicked')) {
            tdDiv.classList.remove('selectedAndDoubleClicked');
        } else {
            tdDiv.classList.add('selectedAndDoubleClicked');
        }
    }

    // Click na bunku
    function inputClickHandler(e) {
        e = e || window.event;
        var tdDiv = e.target || e.srcElement;
        if (tdDiv.tagName == 'DIV') {
            if (tdDiv.classList.contains('focused')) {
                return;
            }
            hideHighlightedCells();
            deselectCells();
            tdDiv.classList.add('focused');
            tdDiv.setAttribute('contenteditable', 'true');
            tdDiv.focus();
            if (tdDiv.getAttribute('expression') != "") {
                tdDiv.innerHTML = tdDiv.getAttribute('expression');
                return;
            }
        }
    }

    // Ak bunka stratila focus
    function inputFocusOutHandler(e) {
        e = e || window.event;
        var tdDiv = e.target || e.srcElement;
        if (tdDiv.tagName == 'DIV') {
            var value = tdDiv.innerHTML;
            if (value.length > 0) {
                if (value.charAt(0) == '=') {
                    tdDiv.setAttribute('expression', value);
                } else {
                    tdDiv.setAttribute('expression', "");
                }
            }

            recomputeTable();        
        }
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
            var tdDiv = tdElm.querySelector(".tdDiv");
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
        tdDiv.classList.add('focused');
        tdDiv.setAttribute('contenteditable', 'true');
        tdDiv.focus();
        //FIXME not working
        if (tdDiv.getAttribute('expression') != "") {
            var expression = tdDiv.getAttribute('expression');
            tdDiv.innerHTML = expression;
        }
    }

    // Zistenie dalsieho indexu focusnutej bunky
    function getNextTableCellIndex(arrow) {
        var tdDiv = table.getElementsByClassName('focused')[0];
        var rowIndex = tdDiv.closest('tr').rowIndex;
        var colIndex = tdDiv.closest('td').cellIndex;
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
            startRowIndex = e.target.parentElement.parentElement.rowIndex;
            startCellIndex = e.target.parentElement.cellIndex;
        })

        table.addEventListener('mousemove', function(e) {
            if (isMouseDown) {
                endRowIndex = e.target.parentElement.parentElement.rowIndex;
                endCellIndex = e.target.parentElement.cellIndex;
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
                endRowIndex = e.target.parentElement.parentElement.rowIndex;
                endCellIndex = e.target.parentElement.cellIndex;
                if ((startRowIndex != endRowIndex) || (startCellIndex != endCellIndex)) {
                    calculateSelection();
                }
            }
            isMouseDown = false;
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
                    var tdDiv = tdElm.querySelector(".tdDiv");
                    tdDiv.classList.add('selected');
                }        
            }
        }
    }

    setupHandlers();
    setupListeners();
    selectingCells();
    table.onkeydown = checkKey;
}

//Generovanie random cisel
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
