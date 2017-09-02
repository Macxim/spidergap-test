// Question 1
// ----------
// Write a function called deepClone which takes an object and creates a copy of it.
// e.g. {name: "Paddy", address: {town: "Lerum", country: "Sweden"}}
//   -> {name: "Paddy", address: {town: "Lerum", country: "Sweden"}}
//

function deepClone(object) {
  var copy;

  if (null == object || "object" != typeof object) return object;

  if (object instanceof Array) {
    copy = [];
    for (var i = 0; i < object.length; i++) {
      copy[i] = clone(object[i]);
    }
    return copy;
  }

  if (object instanceof Object) {
    copy = {};
    for (var attr in object) {
      if (object.hasOwnProperty(attr)) {
        copy[attr] = deepClone(object[attr]);
      }
    }
    return copy;
  }
}

var testObj = {name: "Paddy", address: {town: "Lerum", country: "Sweden"}}

var copiedObj = deepClone(testObj);

console.log('Question 1: ', copiedObj);



















// Question 2
// ----------
// We'd like to contact partners with offices within 100km of central London
// (coordinates 51.515419, -0.141099) to invite them out for a meal.
//                       --------------
// Write a NodeJS/JavaScript program that reads our list of partners
// and outputs the company names and addresses of matching partners
// (with offices within 100km) sorted by company name (ascending).


function getJSON(path, callback) {
  const httpRequest = new XMLHttpRequest();
  httpRequest.onload = () => {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
      const data = JSON.parse(httpRequest.responseText);
      if (callback) { callback(data); }
    }
  };
  httpRequest.open('GET', path, true);
  httpRequest.send();
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = degToRad(lat2-lat1);
  var dLon = degToRad(lon2-lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function degToRad(degrees) {
  return degrees * (Math.PI/180)
}

function sortDataByKey (data, prop){
  return data.sort( (a, b) => (a[prop] > b[prop]) )
}

getJSON('https://success.spidergap.com/partners.json', function (data) {
  var partners = data;

  // Central London Coordinates
  var CL_lat = 51.515419;
  var CL_lon = -0.141099;

  // Distance from Central London
  var requiredDistanceFromCL = 100;

  // Matching partners object
  var matchingPartners = partners

  .map(function (partner) {

    var offices = partner.offices;
    var distance;

    offices.forEach( function (office) {
      var lat = office.coordinates.split(',')[0]
      var lon = office.coordinates.split(',')[1]

      var distanceFromCL = getDistanceFromLatLonInKm(CL_lat, CL_lon, lat, lon);
      distance = Math.floor(distanceFromCL);
      office.distance = distance;
    })
    return partner;
  })

  .filter(function (el) {
    return el.offices.some(function (office) {
      return office.distance <= requiredDistanceFromCL
    })
  })

  console.log('Question 2: ', matchingPartners);

  renderCompanies(sortDataByKey(matchingPartners, 'organization'));
})


function renderCompanies(partners) {
  var requiredDistanceFromCL = 100;

  var view;
  var viewOffices;
  var partnersContainer = document.getElementById('companies');

  partners.forEach(function (partner) {
    view = document.createElement('div');
    view.innerHTML = "<div class='companies__item'><h5><a href='"+ partner.website +"'>"+ partner.organization +"</a></h5></div>";

    partner.offices.forEach(function (office) {
      if (office.distance <= requiredDistanceFromCL){
        view.innerHTML += "<div class='companies-offices__item rounded'><h6 class='companies-office__item-title'>"+ office.location +"</h6><p><a target='_blank' href='https://www.google.com/maps/search/?api=1&query="+ office.coordinates + "'>" + office.address + "</a><p><span class='label label-secondary'>Distance: " + office.distance + " km</span></div>";
      }

      partnersContainer.appendChild(view)
    })

  })
}
