(() => {
  "use strict";
  kintone.events.on('app.record.index.show', (event) => {
    if (event.viewId !== 5299966){
      return;
    }

    const myIndexButton = document.createElement('button');
    myIndexButton.id = 'my_index_buton';
    myIndexButton.innerHTML = 'CSV出力'

    myIndexButton.onclick = () => {
      window.confirm('CSVを出力します');
    };

    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
  });
})();
