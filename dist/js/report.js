"use strict";

const L = console.log;
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
const timeFormat = d3.timeFormat("%m/%d %H:%M:%S");
$(() => {
  let form = $(".liquid_repot");
  form.submit(e => {
    e.preventDefault();
    e.stopPropagation();
    if(!$(".loading").hasClass('d-none')){
      return;
    }
    $("input", form).each(function () {
      localStorage.setItem($(this).attr('id'), $(this).val());
    });
    getFromLiquid($("#liquid_key").val(), $("#liquid_secret").val());
  });
  $("input", form).each(function () {
    let val = localStorage.getItem($(this).attr('id'));
    if (val) {
      $(this).val(val);
    }
  });
  $('#from').datepicker();
  form.submit();
});
function pad(num) {
  return ("0" + num).slice(-2);
}
function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs % 60;
  var hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}
function drawData(ds,from) {
  ds = ds.sort((a, b) => a.close.time.getTime() - b.close.time.getTime());
  let wins = ds.filter(d => d.profit > 0);
  function round5(d) {
    return Math.round(d * 100000) / 100000;
  }

  let draw = {};
  draw["期間"] = timeFormat(new Date(from)) + " ~ " + timeFormat(new Date());
  let span = new Date().getTime() - from;
  draw["期間"] += "  [" + hhmmss(span / 1000) + "]";

  draw["取引数"] = ds.length;
  draw["勝率"] = `${parseInt(wins.length / ds.length * 100)} % ( ${wins.length} / ${ds.length} )`;
  draw["損益"] = round5(d3.sum(ds, d => d.profit)) + " jpy";
  draw["平均損益"] = round5(d3.mean(ds, d => d.profit)) + " jpy";
  draw["最大利益"] = d3.max(ds, d => d.profit) + " jpy";
  draw["最大損失"] = d3.min(ds, d => d.profit) + " jpy";
  let price_range = d3.sum(ds, d => d.price_range);
  draw["値幅"] = parseInt(price_range) + " jpy";
  draw["平均値幅"] = parseInt(price_range / ds.length) + " jpy";
  draw["トレードの長さの平均"] = parseInt(d3.mean(ds, d => d.length)) + " sec";
  draw["トレードの長さの最大"] = d3.max(ds, d => d.length) + " sec";

  let area = $(".liquid_repot_draw");
  area.html("");
  for (let name in draw) {
    area.append($(`<dt class="col-sm-5">${name}<dt>`));
    area.append($(`<dt class="col-sm-7">${draw[name]}<dt>`));
  }
  drawChart(ds);
};
function drawChart(ds) {
  let data = ds.map(d => {
    return {
      t : d.close.time.getTime(),
      y : d.total,
    }
  })
  let options = {
      aspectRatio : 3,
      legend : false,
      scales: {
          xAxes: [{
              type: 'time',
              time: {
                  displayFormats: {
                      hour: 'MM/DD HH:mm',
                      minute : 'HH:mm',
                  }
              },
              gridLines: {
                color: "rgba(255, 255, 255, 0.3)"
              },
          }],
          yAxes: [{
              gridLines: {
                color: "rgba(255, 255, 255, 0.3)",
                zeroLineColor : "#CCCCCC",
              },
              ticks : {
                padding : 10
              }
          }],
      }
  };
  var myLineChart = new Chart(profit_chart.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'profit',

        backgroundColor: "red",
        borderColor: "red",
        data: data,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      }]
    },
    options: options
  });
  drawTable(ds);
}
function drawTable(ds) {
  ds = ds.sort((a, b) => b.close.time.getTime() - a.close.time.getTime());
  ds = ds.map(d => {
    d.open_price = d.open.price;
    d.close_price = d.close.price;
    d.open = d.open.time;
    d.close = d.close.time;
    return d;
  });
  let keys = ["id","symbol","side","open","open_price","close","close_price","amount","profit"];
  // let keys = Object.keys(ds[0]);
  $("table").removeClass('d-none');
  let trAll = d3.select("tbody")
    .selectAll("tr")
    .data(ds, d => d.id);
  trAll.exit().remove();
  let trEnter = trAll.enter()
    .append("tr");
  for(let name of keys){
    trEnter.append("td")
      .attr('class',"table_" + name);
  }
  trEnter = trEnter.merge(trAll);
  for(let name of keys){
    trEnter.select("td.table_" + name)
        .text(function(d){
            if(name == "open" || name == "close"){
              return timeFormat(d[name]);
            }
            if(name == "open_price" || name == "close_price"){
              return d[name];
            }
            return d[name];
        });
  }
};
async function getFromLiquid(id, token) {
  let alert = $(".alert-danger");
  alert.addClass("d-none");
  const liquid = new ccxt.liquid({
    apiKey: id,
    secret: token,
    proxy: 'https://cors-anywhere.herokuapp.com/'
  });
  let table = {};
  let max;
  let timeMax = new Date("2019/08/10");
  let page = 1;
  let from = $("#from").val();
  from = new Date(from).getTime();
  $(".loading").removeClass('d-none');

  while (true) {
    L("requesting page", page);
    let ds;
    try {
      ds = await liquid.privateGetTrades({
        funding_currency: "JPY",
        limit: 100,
        page: page,
        status: "closed"
      });
    } catch (e) {
      alert.text(e.message);
      alert.removeClass("d-none");
      $(".loading").addClass('d-none');
      return;
    }

    max = ds.total_pages;
    let needBreak = false;
    ds = ds.models;

    ds = ds.map(d => {
      let range = d["close_price"] - d["open_price"];
      if(d.side == "short"){
        range *= -1;
      }
      return {
        id: d.id,
        open: {
          price: d["open_price"] - 0,
          time: new Date(d["created_at"] * 1000)
        },
        close: {
          price: d["close_price"] - 0,
          time: new Date(d["updated_at"] * 1000)
        },
        symbol: d.currency_pair_code,
        profit: d.pnl - 0,
        side: d.side,
        amount: d.quantity - 0,
        length: d["updated_at"] - d["created_at"],
        price_range : range
      };
    });
    $(".loading").addClass('d-none');
    for (let d of ds) {
      if (/*table[d.id] || */d.open.time.getTime() < from) {
        needBreak = true;
        break;
      }
      table[d.id] = d;
    }
    if(page == max || needBreak) {
      break;
    }
    page++;
    await sleep(1000);
  }
  let ds = Object.values(table);
  let total = 0;
  for(let d of ds){
    total += d.profit;
    d.total = total;
  }
  drawData(ds,from);
}
