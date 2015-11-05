$(document).ready(function() {

// CONSTANTES ---------------------------------------------------------------
   var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5";
   var API_WORLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key="+ API_WORLDTIME_KEY +"&q=";
   var API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
   var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
   var IMG_WEATHER = "http://openweathermap.org/img/w/";

// VARIABLES ----------------------------------------------------------------
   var cityWeather = {};
   cityWeather.zone;
   cityWeather.icon;
   cityWeather.temp;
   cityWeather.temp_max;
   cityWeather.temp_min;
   cityWeather.main;

   var today = new Date();
   var timeNow = today.toLocaleTimeString();

// CACHEADO DE ELEMENTOS ----------------------------------------------------
   var $body = $("body");
   var $loader = $(".loader");
   var newCityName = $("[data-input='cityAdd']");
   var buttonAdd = $("[data-button='add']");
   var buttonLoad = $("[data-saved-cities]");


// FUNCIONES

   $(buttonAdd).on("click", addNewCity);
   $(newCityName).on("keypress", function(e) {
      if(e.which == 13) {
         addNewCity(e);
      }
   });
   $(savedCities).on('click', loadSavedCities);

   if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCoords, errorFound);
   } else {
      alert("Por favor, actualiza tu navegador");
   }

   function errorFound(error) {
      alert("Un error ocurrió: " + error.code);
      // 0: Error desconocido
      // 1: Permiso denegado
      // 2: Posición no está disponible
      // 3: Timeout
   };

   function getCoords(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      //console.log("Tu posición es: " + lat + "," + lon);
      $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
   };

   function getCurrentWeather(data) {
      cityWeather.zone = data.name;
      cityWeather.icon = IMG_WEATHER +data.weather[0].icon + ".png";
      cityWeather.temp = data.main.temp - 273.15;
      cityWeather.temp_max = data.main.temp_max - 273.15;
      cityWeather.temp_min = data.main.temp_min - 273.15;
      cityWeather.main = data.weather[0].main;

      renderTemplate(cityWeather, null);
   };

   function activateTemplate(id) {
      var t = document.querySelector(id);
      return document.importNode(t.content, true);
   };

   function renderTemplate(cityWeather, localTime) {
      var clone = activateTemplate("#template--city");
      var timeToShow;

      if(localTime) {
         timeToShow = localTime.split(" ")[1];
      } else {
         timeToShow = timeNow;
      }

      clone.querySelector("[data-time]").innerHTML = timeToShow;
      clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
      clone.querySelector("[data-icon]").src = cityWeather.icon;
      clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
      clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
      clone.querySelector("[data-temp='current']").innerHTML =
      cityWeather.temp.toFixed(1);

      $($loader).hide();
      $($body).append(clone);
   };

   function addNewCity(e) {
      e.preventDefault();
      $.getJSON(API_WEATHER_URL + "q=" + $(newCityName).val(), getWeatherNewCity);
   };

   function getWeatherNewCity(data) {

      $.getJSON(API_WORLDTIME + $(newCityName).val(), function(response) {

         $(newCityName).val("");

         cityWeather = {};
         cityWeather.zone = data.name;
         cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
         cityWeather.temp = data.main.temp - 273.15;
         cityWeather.temp_max = data.main.temp_max - 273.15;
         cityWeather.temp_min = data.main.temp_min - 273.15;

         renderTemplate(cityWeather, response.data.time_zone[0].localtime);

         cities.push(cityWeather);
         localStorage.setItem("cities", JSON.stringify(cities));
      });

   }

});
