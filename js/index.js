// 地域選択ボタンを作成
const region = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州'];
for (const r of region) {
  $("#button").append('<button type="button" '
    + 'value="' + r + '" '
    + 'onClick="goToRegion(this)">'
    + r + '</button>')
}

// ラジオボタンを作成
for (let i=1; i<=5; i++) {
  $("#r1").append('<input type="radio" name="r1" '
    + 'value="' + i + '" '
    + 'onchange="modifyStd(this)">'
    + i + '</input>')
}

r1_areaFee = 100000;


const region_color = {
  'area': "aaaaaa"
};

const DEF_map_style = {
  // エリアの背景色
  "area": {
    "default": "dcdcdc"
  },
  // テキスト(岡山県,岡山市,....)の色
  "label": {
    "default": "696969"
  },
  // エリアの境界線の色
  "border": {
    "default": "aaa"
  },
  // バックグラウンド(海)の色
  "bg": "b0c4de"
}

// 地域選択後に描画するマップのスタイルを作成
function setRegionStyle(r) {
  let region_style = {}; // 返り値
  let s, f; // 選択地域の最初の都道府県コード(s)と最後の都道府県コード(f)
  let dataset = dataset_areaFee[r];

  switch (r) {
    case '北海道':
      s=1; f=1;
      region_style = {
        "lat": 43.568246,
        "lng": 142.740234,
        "zoom_level": 8
      };
      break;
    case '東北':
      s=2; f=7;
      region_style = {
        "lat": 39.338327,
        "lng": 140.916504,
        "zoom_level": 8
      };
      break;
    case '関東':
      s=8; f=14;
      region_style = {
        "lat": 35.764113,
        "lng": 139.823364,
        "zoom_level": 9
      };
      break;
    case '中部':
      s=15; f=23;
      region_style = {
        "lat": 35.968885,
        "lng": 137.373413,
        "zoom_level": 8
      };
      break;
    case '近畿':
      s=24; f=30;
      region_style = {
        "lat": 34.903720,
        "lng": 135.654053,
        "zoom_level": 9
      };
      break;
    case '中国':
      s=31; f=35;
      region_style = {
        "lat": 34.822590,
        "lng": 132.825073,
        "zoom_level": 9
      };
      break;
    case '四国':
      s=36; f=39;
      region_style = {
        "lat": 33.586931,
        "lng": 133.495239,
        "zoom_level": 9
      };
      break;
    case '九州':
      s=40; f=47;
      region_style = {
        "lat": 30.867987,
        "lng": 130.787109,
        "zoom_level": 7
      };
      break;
    default:
  }

  let area_color = {
    "default": DEF_map_style.area.default
  }
  function normAreaFee(value) {
    if(value < r1_areaFee) return 0;
    if(value > r1_areaFee*2) return 1;
    else{
      return (value - r1_areaFee)/value; // 相対誤差

  }
    // if (value>50000) return 1;
    // else if (value <= 10000) return 0.2;
    // else return Math.floor(value/10000)*0.2;
  }

  function cov16(n){
  sin = "0123456789ABCDEF";
  if(n>255)return 'FF';
  if(n<0) return '00';
  return sin.charAt(Math.floor(n/16))+sin.charAt(n%16);//16進数2桁を返す
  }

  function defColorCode(value) {
//    const opacity = normAreaFee(value);
//    const gb = ('0' + (1-opacity).toString(16)).slice(-2)
    let gb = cov16(Math.round(normAreaFee(value) * 0xff));
    return ('ff'+ gb + gb);
    console.log(r1_areaFee);
  }
  for (let d of dataset){
    area_color[d.cityCode] = defColorCode(d.areaFee);
  }

  let map_style = DEF_map_style;
  map_style.area = area_color;
  region_style.map = map_style;

  return region_style;
}

function calAreaFeeMissMatch(area) {
  let dataset = dataset_areaFee[area];
  let areaFeeMissMatch = {
    "default": DEF_map_style.area.default
  }
  for (let d of dataset){
    areaFeeMissMatch[d.cityCode] = d.areaFee;
  }
  return areaFeeMissMatch;
}

// 選択地域の色変更と地域への画面遷移
function goToRegion(button) {
  const r = button.value;
  const region_style = setRegionStyle(r);
console.log(r1_areaFee)

  var missmatch = {};
  missmatch.areaFee = calAreaFeeMissMatch(r);// r は選択された地域
  temp = missmatch.areaFee;

  blankmap.setStyle(region_style.map)
  const p = new Y.LatLng(region_style.lat, region_style.lng);
  map.setZoom(region_style.zoom_level, true, p, true);
}

// 基準選択による色変更
function modifyStd(r1){

  r1_areaFee = r1.value * 10000

  switch (r1.value) {
    case '1': r1_areaFee = 7163;
    case 2: r1_areaFee = 13101;
    case 3: r1_areaFee = 21212;
    case 4: r1_areaFee = 42803;
    case 5: r1_areaFee = 42835;
    default: console.log(r1.value, "noob");
  }
}

window.onload = function() {
  map = new Y.Map("map", {
    "configure": {
      "scrollWheelZoom": true
    }
  });
  map.addControl(new Y.LayerSetControl());
  map.addControl(new Y.SliderZoomControlHorizontal());

  //白地図レイヤーを作成
  blankmap = new Y.BlankMapLayer();
  let map_style = DEF_map_style;
  blankmap.setStyle(map_style)
  // レイヤーセットの作成
  const layerset = new Y.LayerSet("白地図", [blankmap], {
    "maxZoom": 20,
    "minZoom": 6
  });
  //Mapオブジェクトにレイヤーセットを追加
  map.addLayerSet("blankmap", layerset);
  //地図を描画
  map.drawMap(new Y.LatLng(37, 135.2), 6,
              Y.LayerSetId.NORMAL);
  // 白地図レイヤーを表示
  map.setLayerSet("blankmap");
  map.bind('click', function(latlng){
    query = '?lat=' + latlng.Lat + '&lon=' + latlng.Lon
    $.get('http://www.finds.jp/ws/rgeocode.php' + query,
      function (data) {
        // 都道府県名: pname
        // 市区町村名: mname
        console.log(data.match(/<pname>(.*?)<\/pname>/g)[0].slice(7,-8));
      }
    )
	});
}
