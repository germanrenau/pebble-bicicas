var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var my_lat = 40;
var my_lon = 0;

//Sanitize UTF8
function utf8(str) {
  return decodeURI(encodeURI(str));
}

//Sort by distance:
function compare(a,b) {
  if (parseInt (a.distancia) < parseInt (b.distancia))
     return -1;
  if (parseInt (a.distancia) > parseInt (b.distancia))
    return 1;
  return 0;
}

// Show splash screen while waiting for data
var splashWindow = new UI.Window();


var parseFeed = function(data, max) {
  var items = [];
  var length = data[0].ocupacion.length;
  for(var i = 0; i < length; i++) {
    // Always upper case the description string
    var title = data[0].ocupacion[i].punto;

    // Get date/time substring
    var ocupados = data[0].ocupacion[i].ocupados;
    var puestos = data[0].ocupacion[i].puestos;
    var distancia_en_m = distancia(data[0].ocupacion[i].latitud, data[0].ocupacion[i].longitud);
    var direccion = rumbo(data[0].ocupacion[i].latitud, data[0].ocupacion[i].longitud);
    var info = ocupados + "/" + puestos + " (" + distancia_en_m + " m)";
   
    console.log(utf8(title));
    // Add to menu items array
    items.push({
      title: utf8(title),
      subtitle: utf8(info),
      distancia: utf8(distancia_en_m)
    });
  }
  
  items.sort(compare); 
  
  // Finally return whole array
  return items.slice(0, Math.min(max, items.length));
};




function rumbo(lat1,lon1) {
        var dLon = (my_lon-lon1);
        var y = Math.sin(dLon) * Math.cos(my_lat);
        var x = Math.cos(lat1)*Math.sin(my_lat) - Math.sin(lat1)*Math.cos(my_lat)*Math.cos(dLon);
        var brng = Math.atan2(y, x) * 180 / Math.PI;
        return 360 - ((brng + 360) % 360);
}

function distancia(lat1, lon1) {
  var R = 6371000;
  var a = 
     0.5 - Math.cos((my_lat - lat1) * Math.PI / 180)/2 + 
     Math.cos(lat1 * Math.PI / 180) * Math.cos(my_lat * Math.PI / 180) * 
     (1 - Math.cos((my_lon - lon1) * Math.PI / 180))/2;

  return (R * 2 * Math.asin(Math.sqrt(a))).toFixed(0);
}

navigator.geolocation.getCurrentPosition(function(pos) {
  
    console.log('dentro geo');
    console.log('lat: ' + pos.coords.latitude);
    console.log('lon: ' + pos.coords.longitude);
    my_lat = pos.coords.latitude;
    my_lon = pos.coords.longitude;
  
  
});

function getData() {
  ajax(
    {
      url:'http://bicicas.es/class/ubicaciones.php',
      type:'json'
    },
    function(data) {
      // Create an array of Menu items
      console.log(data[0].ocupacion.length-1);
      var menuItems = parseFeed(data, 10);
  
      // Construct Menu to show to user
      var resultsMenu = new UI.Menu({
        sections: [{
          title: 'Disponibles Bicicas',
          items: menuItems
        }]
      });
      
      // Show the Menu, hide the splash
      resultsMenu.show();
      splashWindow.hide();
  
    },
    function(error) {
      console.log('Descarga fallida: ' + error);
    }
  );
}

//Get Data
getData();



// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Obteniendo posición...\n\nDescargando datos...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

// Make request to bicicas

