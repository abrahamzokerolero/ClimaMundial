// clousure se autoejecuta cuando ha obtenido los datos necesarios
// basicamente es un archivo autoejecutable

(function(){

	var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5";
	var API_WORLDTIME_URL = "http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";

	var API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
	var API_WEATHER_IMG_WEATHER = "http://openweathermap.org/img/w/";

	var today = new Date();
	var timeNow = today.toLocaleTimeString();

	var $loader = $(".loader");
	var $body = $("body");
	var nombreNuevaCiudad = $("[data-input='cityAdd']");
	var buttonAdd = $("[data-button='add']");

	// capturamos el elemento con JQuery
	var buttonLoad = $("[data-saved-cities]");

	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	// creamos una arreglo para agregar las ciudades aqui
	var cities=[];


	buttonAdd.on("click" , addNewCity);

	// agregamos el evento al nuevo boton para cargar las ciudades vistas
	buttonLoad.on("click", loadSavedCities);

	nombreNuevaCiudad.on("keypress" , function(event){
		if(event.which==13){
			addNewCity(event);
		}		
	});

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(getCoords, errorFound);
	} else {
		alert("actualiza tu navegador");
	}

	function errorFound(error){
		alert("Un error ocurrio " + error.code);
		
	};

	function getCoords(position){
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		console.log("Tu posicion es: " + lat + "," + lon);		
		$.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
	};

	function getCurrentWeather(data) {
		cityWeather.zone = data.name;
		cityWeather.icon = API_WEATHER_IMG_WEATHER + data.weather[0].icon + ".png";
		cityWeather.temp = data.main.temp - 273.15;
		cityWeather.temp_max = data.main.temp_max - 273.15;
		cityWeather.temp_min = data.main.temp_min -273.15;
		cityWeather.main = data.weather[0].main;
		renderTemplate(cityWeather);
	};

	function activateTemplate(id){
		var t = document.querySelector(id);
		return document.importNode(t.content, true);
	};

	function renderTemplate(cityWeather, localtime){
		var clone = activateTemplate("#template--city");
		var timeToShow;

		if(localtime){
			timeToShow = localtime;
		} 
		else {
			timeToShow =timeNow;
		}

		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-city]").innerHTML = cityWeather.zone.toUpperCase();
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1) + "°";
		clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1) + "°";
		clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1) + "°C";
	
		$loader.hide();
		$body.append(clone);
	};


	function addNewCity(event){
		event.preventDefault();
		$.getJSON(API_WEATHER_URL + "q=" + nombreNuevaCiudad.val(), getWeatherNewCity);
	};

	function getWeatherNewCity(data){
		$.getJSON(API_WORLDTIME_URL + data.coord.lat + "," + data.coord.lon, function(response){
			
			nombreNuevaCiudad.val("");
			cityWeather = {};
			cityWeather.zone = data.name;
			cityWeather.icon = API_WEATHER_IMG_WEATHER + data.weather[0].icon + ".png";
			cityWeather.temp = data.main.temp - 273.15;
			cityWeather.temp_max = data.main.temp_max - 273.15;
			cityWeather.temp_min = data.main.temp_min -273.15;
			cityWeather.main = data.weather[0].main;
		
			renderTemplate(cityWeather, response.data.time_zone[0].localtime.split(" ")[1]);

			// esto nos permite agregar el objeto cityWeather en el arreglo creado
			cities.push(cityWeather); 
			// luego agregamos a localStorage el arreglo cities pero en formato de cadena  usamos un identificador para despues poder llamarlo, 
			// en este caso el identificador sera "cities"
			localStorage.setItem("cities", JSON.stringify(cities));
		});	
	};

	function loadSavedCities(event){
		// capturamos el evento y evitamos que haga algun comportamiento extraño
		event.preventDefault();

		if(cities != null){
			// creamos una funcion que recorra al arreglo cities
			function renderCities(cities){

				// por cada elemento de cities, -cada cityWeather Diferente- lo mostraremos con render Template
				cities.forEach(function(city){
					renderTemplate(city);
				});
			};

			// cities sera llenada con lo que se encuentre en local storage en forma de objetos JSON
			cities =JSON.parse( localStorage.getItem("cities"));
			renderCities(cities);
		}
		else{
			// si localStorage esta vacia mostramos un mensaje 
			alert("'Aun no ha hecho niguna busqueda'");
		}
	};

})();

