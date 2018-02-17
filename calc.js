// Bc. Adam Bezák xbezak01
// WAP - Tabulkovy kalkulator

function tableCreate(rowCount, colCount, tableId){
    var body = document.body,
        table  = document.createElement('table');
    table.classList.add(tableId);

    for(var i = 0; i < rowCount; i++){
        var tr = table.insertRow();
        for(var j = 0; j < colCount; j++){
            var td = tr.insertCell();
            td.appendChild(document.createTextNode('Cell'));
        }
    }
    body.appendChild(table);

    function highlightCells() {
        var all = document.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            all[i].onclick = inputClickHandler;
            all[i].ondblclick = inputDoubleClickHandler;
        }
    }

    function hideHighlightedCells() {
        var all = table.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            all[i].classList.remove('selected');
        }
    }

    function deselectCells() {
        var all = document.getElementsByTagName("td");
        for (var i=0;i<all.length;i++) {
            all[i].classList.remove('focused');
            all[i].removeAttribute('contenteditable');
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
        tdElm.focus();
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
        tdElm.focus();
    }

    function getNextTableCellIndex(arrow) {
        var tdElm = table.getElementsByClassName('focused')[0];
        var rowIndex = tdElm.closest('tr').rowIndex;
        var colIndex = tdElm.closest('td').cellIndex;
        console.log('row: ' + rowIndex);
        console.log('col: ' + colIndex);
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

    highlightCells();
    selectingCells();
    table.onkeydown = checkKey;
}