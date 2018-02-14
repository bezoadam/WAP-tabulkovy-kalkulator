function tableCreate(rowCount, colCount, tableId){
    var body = document.body,
        tbl  = document.createElement('table');
    tbl.style.width  = '100px';
    tbl.style.border = '1px solid black';
    tbl.id = tableId;

    for(var i = 0; i < rowCount; i++){
        var tr = tbl.insertRow();
        for(var j = 0; j < colCount; j++){
            var td = tr.insertCell();
            td.appendChild(document.createTextNode('Cell'));
            td.style.border = '1px solid black';
        }
    }
    body.appendChild(tbl);
}

function highlight_cells() {
    var all = document.getElementsByTagName("td");
    for (var i=0;i<all.length;i++) {
        all[i].onclick = inputClickHandler;       
    }
}

function deselect_cells() {
    var all = document.getElementsByTagName("td");
    for (var i=0;i<all.length;i++) {
        all[i].style.borderWidth = '1px';   
        all[i].style.borderColor = 'black';
        all[i].id = '';
        all[i].removeAttribute('contenteditable');
    }
}

function inputClickHandler(e) {
    deselect_cells();
    e = e || window.event;
    var tdElm = e.target||e.srcElement;
    tdElm.style.borderWidth = '2px';   
    tdElm.style.borderColor = 'blue';
    tdElm.id = 'selected';
    tdElm.setAttribute('contenteditable', 'true')
    if(tdElm.style.backgroundColor == 'rgb(255, 0, 0)') {
        tdElm.style.backgroundColor = '#fff';
    } else {
        tdElm.style.backgroundColor = '#f00';
    }
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
    var tdElm = table.rows[index[0]].cells[index[1]];
    if (tdElm == null) {
        console.log('out of table');
        return;
    }
    deselect_cells();
    tdElm.style.borderWidth = '2px';   
    tdElm.style.borderColor = 'blue';
    tdElm.id = 'selected';
    tdElm.setAttribute('contenteditable', 'true');
    tdElm.focus();
}

function getNextTableCellIndex(arrow) {
    var table = document.getElementById('table');
    var tdElm = document.getElementById('selected');
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

window.onload = highlight_cells;
window.onkeydown = checkKey;
