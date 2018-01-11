(function() {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){
    if (event.viewName !== '出力用一覧（当月&出力済除外）'){
      return;
    }

    var myIndexButton = document.createElement('button');
    myIndexButton.id = 'my_index_buton';
    myIndexButton.innerHTML = 'CSV出力'

    myIndexButton.onclick = function() {
      window.confirm('CSVを出力します');
    };

    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
  });
})();
