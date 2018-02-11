(function() {

    "use strict";

    if ((window.URL || window.webkitURL).createObjectURL == null) {
      // non supported browser
        return;
    }

    function updateExpenseRecord(appId, records) {
      kintone.api(
        kintone.api.url('/k/v1/records', true),
        'PUT', {
          app: appId,
          records: records
        },
        function(resp) {
          console.log(resp);
        }, function(error) {
          console.log(error);
        });
    }

    function createPutRecords(records) {
      var putRecords = [];
      for (var m = 0; m < records.length; m++) {
        var record = records[m];
        putRecords[m] = {
          id:record['$id'].value,
          record:{
            export_to_csv:{
              value:["済"]
            }
          }
        };
      }
      return putRecords;
    }

    function downloadCSV(expenseData) {
      var stringToArray = function(data) {
        var array = [],i,il = data.length;
        for (i=0; i<il; i++) array.push(data.charCodeAt(i));
        return array;
      };
  
      var csvbuf = expenseData.map(function(e){return e.join(',')}).join('\r\n');
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
      } else {
        return;
      }
    }

    function fetchRecords(appId, offset, limit, records) {
      var offset = offset || 0;
      var limit = limit || 500;
      var allRecords = records || [];
      var query = 'payed_at != THIS_MONTH() and export_to_csv not in ("済") order by payed_at asc'
      var params = { app: appId, query: query + ' limit ' + limit + ' offset ' + offset };
      return kintone.api('/k/v1/records', 'GET', params).then(function(res) {
        allRecords = allRecords.concat(res.records);
        if (res.records.length === limit ) {
          return fetchRecords(appId, offset + limit, limit, allRecords);
        }
        return allRecords;
      });
    }

    function createCsvFile(records) {
      var expenseData = [];
      var row = [];

      records.forEach(record => {
        row = [];
        row.push(record.export_to_csv.value);
        row.push(record.is_checked_by_tax_accountant.value);
        row.push(record.tax.value);
        row.push(record.payer_name.value);
        row.push(record.expense.value);
        row.push(record.content.value);
        row.push(record.amount_of_money.value);
        row.push(record.recipt.value);
        row.push(record['作成日時'].value);
        expenseData.push(row);
      });

      downloadCSV(expenseData);
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
        var appId = kintone.app.getId();
        fetchRecords(appId).then(function(records) {
          createCsvFile(records);
          // var updateRecords = createPutRecords(records);
          // updateExpenseRecord(appId, updateRecords);
        });
      };

    headerElement.appendChild(exportButton);
  });
})();
