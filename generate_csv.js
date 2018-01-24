(function() {

  "use strict";

    if ((window.URL || window.webkitURL).createObjectURL == null) {
      // non supported browser
      return;
    }
  
    function downloadCSV(expenseCsvData) {
      var stringToArray = function(csv) {
        var array = [],i,il = csv.length;
        for (i=0; i<il; i++) array.push(csv.charCodeAt(i));
        return array;
      };
  
      var csvbuf = expenseCsvData.map(function(e){return e.join(',')}).join('\r\n');
      var array = stringToArray(csvbuf);
      var sjisArray = Encoding.convert(array, "SJIS", "UNICODE");
      var uint8Array = new Uint8Array(sjisArray);
      var blob = new Blob([uint8Array], { type: 'text/csv' });
      
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var fileName = "export.csv";

      var confirmResponse = confirm('CSVを出力します');
      if (confirmResponse) {
        if (window.navigator.msSaveOrOpenBlob) {
          // for IE
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          // for not IE
          var link = document.createElement('a');
          var e = document.createEvent('MouseEvents');
          e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          link.download = fileName;
          link.href = url;
          link.dispatchEvent(e);
        }

        // ここにCSV出力のチェックを入れる

      }else{
        return;
      }
    }

    function fetchRecords(appId, offset, limit, records) {
      var offset = offset || 0;
      var limit = limit || 100;
      var allRecords = records || [];
      var params = { app: appId, query: 'order by レコード番号 asc limit ' + limit + ' offset ' + offset };
      return kintone.api('/k/v1/records', 'GET', params).then(function(res) {
        allRecords = allRecords.concat(res.records);
        if (res.records.length === limit ) {
          return fetchRecords(appId, offset + limit, limit, allRecords);
        }
        return allRecords;
      });
    }

    function createCsvFile(records) {
      var expenseCsvData = [];
      var row = [];
      for (var j = 0; j < records.length; j++){
        var record = records[j];
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
        expenseCsvData.push(row);
      }
      downloadCSV(expenseCsvData);
    }
    
    kintone.events.on('app.record.index.show', function(event){
      if (event.viewName !== '出力用一覧（当月&出力済除外）'){
        return;
      }
  
      if (document.getElementById('export-csv') !== null) {
        return;
      }

      var headerElement = kintone.app.getHeaderMenuSpaceElement();
      var exportButton = document.createElement('button');
      exportButton.id = 'export-csv';
      exportButton.innerHTML = 'CSV出力';

      exportButton.onclick = function() {
        fetchRecords(kintone.app.getId()).then(function(records) {
          createCsvFile(records);
        });
      };

    headerElement.appendChild(exportButton);
  });
})();
