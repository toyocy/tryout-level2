(function() {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){
    if (event.viewName !== '出力用一覧（当月&出力済除外）'){
      return;
    }

    if (document.getElementById('export-csv') !== null) {
      return;
    }

    var exportButton = document.createElement('button');
    exportButton.id = 'export-csv';
    exportButton.innerHTML = 'CSV出力'

    var escapeString = function(value) {
      return '"' + (value? value.replace(/"/g, '""'): '') + '"';
    };
        
    if ((window.URL || window.webkitURL).createObjectURL == null) {
      // サポートされていないブラウザ
      return;
    }
  
    var csv = [];
    var row = [];
    for (var i = 0; i < event.records.length; i++){
      var record = event.records[i];
      row = [];
      if (record.is_checked_by_tax_accountant.value != "済") { continue; }
      row.push(record.export_to_csv.value);
      row.push(record.is_checked_by_tax_accountant.value);
      row.push(record.tax.value);
      row.push(record.payer_name.value);
      row.push(record.expense.value);
      row.push(record.content.value);
      row.push(record.amount_of_money.value);
      row.push(record.recipt.value);
      row.push(record['作成日時'].value);
      csv.push(row);
    }

    var stringToArray = function(string) {
      var array = [],i,il=string.length;
      for (i=0; i<il; i++) array.push(string.charCodeAt(i));
      return array;
    };

    var csvbuf = csv.map(function(e){return e.join(',')}).join('\r\n');

    var array = stringToArray(csvbuf);
    var sjisArray = Encoding.convert(array, "SJIS", "UNICODE");
    var uint8Array = new Uint8Array(sjisArray);
    var blob = new Blob([uint8Array], { type: 'text/csv' });
    
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var fileName = "export.csv"

    exportButton.onclick = function() {
      var confirmResponse = confirm('CSVを出力します');
      if (confirmResponse) {
        if (window.navigator.msSaveOrOpenBlob) {
          // for IE
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          //for not IE
          var link = document.createElement('a');
          var e = document.createEvent('MouseEvents');
          e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          link.download = fileName;
          link.href = url;
          link.dispatchEvent(e);
        }
      }else{
        return;
      }
    };
    kintone.app.getHeaderMenuSpaceElement().appendChild(exportButton);
  });
})();
