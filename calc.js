function tableCreate(rowCount, cellCount){
    var body = document.body,
        tbl  = document.createElement('table');
    tbl.style.width  = '100px';
    tbl.style.border = '1px solid black';

    for(var i = 0; i < rowCount; i++){
        var tr = tbl.insertRow();
        for(var j = 0; j < cellCount; j++){
            var td = tr.insertCell();
            td.appendChild(document.createTextNode('Cell'));
            td.style.border = '1px solid black';
        }
    }
    body.appendChild(tbl);
}