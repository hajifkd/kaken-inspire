function _start() {
  let mainf = document.getElementsByName("main");
  if (mainf.length != 1) {
    return;
  }

  mainf[0].onload = () => {
    let maindoc = mainf[0].contentWindow.document.getElementsByName("main");
    if (maindoc.length != 1) {
      return;
    }

    maindoc[0].onload = () => main(maindoc[0].contentWindow.document);
  };

}

function main(doc) {

  let tables = doc.querySelectorAll(".tableBackg .table1");
  let targets = Array.prototype.filter.call(tables, t => {
    let ths = t.getElementsByTagName("th");
    if (ths.length >= 2) {
      return ths[1].innerText.includes('Journal');
    } else {
      return false;
    }
  });
  if (targets.length != 1) {
    return;
  }

  let target = targets[0];
  let columns = Array.prototype.slice.call(target.getElementsByTagName('tr'), 2);

  function fetchInspire(i, url) {
    fetch(url.replace('http://', 'https://'))
      .then(r => r.text())
      .then(t => {
        let d = document.createElement('html');
        d.innerHTML = t;

        let authors = Array.prototype.map.call(d.getElementsByClassName('authorlink'), a => a.innerText);
        doc.getElementsByName(`jissekiInfo.zassiInfo[${i}].happyosha`)[0].value = authors.join(' ');

        doc.getElementsByName(`jissekiInfo.zassiInfo[${i}].hyodai`)[0].value = getOr(d, 'big big strong');

        let journal = d.querySelector('ul li strong');
        if (journal != null) {
          doc.getElementsByName(`jissekiInfo.zassiInfo[${i}].zasshiGakkai`)[0].value = journal.innerText;

          let doi = journal.parentElement.nextElementSibling.nextElementSibling;
          doc.getElementsByName(`jissekiInfo.zassiInfo[${i}].ronbunDoi`)[0].value = getOr(doi, 'a');
        }
      });
  }

  let aw = document.createElement('a');
  aw.appendChild(document.createTextNode("Fetch all from Inspire Author's page"));
  aw.href = '#';
  aw.onclick = () => {
    let url = prompt("Input inspire author URL", 'e.g. http://inspirehep.net/search?p=exactauthor%3AHajime.Fukuda.1&sf=earliestdate');
    if (url) {
      fetch(url.replace('http://', 'https://'))
        .then(r => r.text())
        .then(t => {
          let d = document.createElement('html');
          d.innerHTML = t;

          let thisyear = (new Date()).getFullYear();
          let reg = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(Nov|Dec)(?:ember)?) \d{1,2}, +\d{4}/;

          let recs = Array.prototype.filter.call(d.getElementsByClassName('record_body'), d => {
            let m = d.innerText.match(reg);
            if (!m) return false;

            let date = new Date(m[0]);
            if (date.getFullYear() == thisyear && date.getMonth() < 3) return true;
            else if (date.getFullYear() == thisyear - 1 && date.getMonth() >= 3) return true;
            else return false;
          });

          let ind = 0;
          for (let rec of recs) {
            let link = rec.getElementsByClassName('titlelink');
            if (link.length == 1) {
              fetchInspire(ind++, link[0].href);
            }
          }
        });
    }
  };
  target.getElementsByTagName('th')[0].appendChild(aw);

  for (let i = 0; 2 * i + 1 < columns.length; i++) {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode("Fetch from Inspire"));
    a.href = '#';
    a.onclick = () => {
      let url = prompt("Input inspire URL", 'http://inspirehep.net/record/');
      if (url) fetchInspire(i, url);
    };
    columns[2 * i].getElementsByTagName('td')[0].appendChild(a);
  }

}

function getOr(d, sel) {
  let s = d.querySelector(sel);
  if (s == null) return '';
  else return s.innerText;
}

_start();
