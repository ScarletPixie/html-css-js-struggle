let button = document.getElementById("get-location");
let latText = document.getElementById("latitude");
let longText = document.getElementById("longitude");

button.addEventListener("click", () => {
	console.log("something");
  	navigator.geolocation.getCurrentPosition((position) => {
    let lat = position.coords.latitude;
    let long = position.coords.longitude;

    latText.innerText = lat.toFixed(2);
    longText.innerText = long.toFixed(2);
	console.log(lat);
	console.log(position);
	return;
});
});
