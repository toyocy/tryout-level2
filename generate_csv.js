(function() {
  "use strict";
  kintone.events.on('app.record.index.show', function(events){
    if (events.viewName !== '出力用一覧（当月&出力済除外）'){
      return;
    }

    var myIndexButton = document.createElement('button');
    myIndexButton.id = 'my_index_buton';
    myIndexButton.innerHTML = 'CSV出力'

    var csv = [];
    for (var i = 0; i < events.records.length; i++){
      var record = events.records[i];
      var value = [];
      if (record.is_checked_by_tax_accountant.value != "済") { continue; }
      value.push(record.export_to_csv.value);
      value.push(record.is_checked_by_tax_accountant.value);
      value.push(record.tax.value);
      value.push(record.payer_name.value);
      value.push(record.expense.value);
      value.push(record.content.value);
      value.push(record.amount_of_money.value);
      value.push(record.recipt.value);
      value.push(record['作成日時'].value);
      csv.push(value);
    }

    myIndexButton.onclick = function() {
      var confirmResponse = confirm('CSVを出力します');
      if (confirmResponse) {
        console.log(csv);
      }
      return;
    };

    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
  });
})();
