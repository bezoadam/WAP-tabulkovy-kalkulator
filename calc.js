function tableCreate(rowCount, colCount, tableId){
    var body = document.body,
        tbl  = document.createElement('table');
    tbl.id = tableId;

    for(var i = 0; i < rowCount; i++){
        var tr = tbl.insertRow();
        for(var j = 0; j < colCount; j++){
            var td = tr.insertCell();
            td.appendChild(document.createTextNode('Cell'));
        }
    }
    body.appendChild(tbl);
}

function highlightCells() {
    var all = document.getElementsByTagName("td");
    for (var i=0;i<all.length;i++) {
        all[i].onclick = inputClickHandler;
        all[i].ondblclick = inputDoubleClickHandler;
    }
}

function deselectCells() {
    var all = document.getElementsByTagName("td");
    for (var i=0;i<all.length;i++) {
        all[i].id = '';
        all[i].removeAttribute('contenteditable');
    }
}

function inputDoubleClickHandler(e) {
    e = e || window.event;
    var tdElm = e.target||e.srcElement;
    if(tdElm.style.backgroundColor == 'rgb(255, 0, 0)') {
        tdElm.style.backgroundColor = '#fff';
    } else {
        tdElm.style.backgroundColor = '#f00';
    }    
}

function inputClickHandler(e) {
    deselectCells();
    e = e || window.event;
    var tdElm = e.target||e.srcElement;
    tdElm.id = 'focused';
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
            console.log('err');
            return;
    }

    selectNextTableCell(index)
}

function selectNextTableCell(index) {
    var table = document.getElementById('table');
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
    tdElm.id = 'focused';
    tdElm.setAttribute('contenteditable', 'true');
    tdElm.focus();
}

function getNextTableCellIndex(arrow) {
    var table = document.getElementById('table');
    var tdElm = document.getElementById('focused');
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
    var endRowIndex = null;
    var endCellIndex = null;

    var table = document.getElementById('table');
    table.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        startRowIndex = e.target.parentElement.rowIndex;
        startCellIndex = e.target.cellIndex;
    }, false)

    table.addEventListener('mouseover', function(e) {
        // console.log(e.target.parentElement.rowIndex);
        // console.log(e.target.cellIndex);
    }, false)

    table.addEventListener('mouseup', function(e) {
        if (isMouseDown) {
            endRowIndex = e.target.parentElement.rowIndex;
            endCellIndex = e.target.cellIndex;
            if (startRowIndex != endRowIndex || startCellIndex != endCellIndex) {
                calculateSelection();
            }
        }
        isMouseDown = false;
    }, false)


    function calculateSelection() {
        var rowStart, rowEnd, cellStart, cellEnd;
        
        if (endRowIndex < startRowIndex) {
            rowStart = endRowIndex;
            rowEnd = startRowIndex;
        } else {
            rowStart = startRowIndex;
            rowEnd = endRowIndex;
        }
        
        if (endRowIndex < startCellIndex) {
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


window.onload = highlightCells;
window.onload = selectingCells;
window.onkeydown = checkKey;
