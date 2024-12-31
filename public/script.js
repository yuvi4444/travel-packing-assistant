let selectedDestination = ""; // Variable to store the destination name
let latLng = null; // Variable to store the latitude and longitude

function initMap() {
    const initialLocation = { lat: -25.2744, lng: 133.7751 }; // Example: Centered on Australia
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 3,
        center: initialLocation,
    });

    const geocoder = new google.maps.Geocoder();

    // Add a click listener to the map
    map.addListener("click", (event) => {
        latLng = event.latLng;

        // Reverse geocode the lat/lng to get a place name
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
                selectedDestination = results[0].formatted_address; // Save the place name
                console.log("Selected Destination:", selectedDestination); // Display in console
                alert(`Selected Destination: ${selectedDestination}`);
                fetchWeather(latLng.lat(), latLng.lng()); // Fetch weather for selected location
            } else {
                console.error("Geocoder failed due to:", status);
            }
        });
    });
}

function fetchWeather(lat, lon) {
    const apiKey = "7b639c27ee55a70bf4a1f9eae6a21957"; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    fetch(weatherUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Weather Data:", data);
            alert(`Weather at ${selectedDestination}: ${data.weather[0].description}, Temp: ${data.main.temp}°C`);
        })
        .catch((error) => {
            console.error("Error fetching weather data:", error);
        });
}


// Handle form submission
document.getElementById('travelForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    const result = await response.json();
    alert(result.message);
    if (result.packingList) {
        window.location.href = 'packing-list.html';
    }
});

// Fetch packing list
if (window.location.pathname.includes('packing-list.html')) {
    fetch('/data')
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById('packingList');
            container.innerHTML = data.map(plan => `
                <div>
                    <h2>${plan.destination}</h2>
                    <p>${plan.startDate} - ${plan.endDate}</p>
                    <p>Packing List: ${plan.packingList}</p>
                </div>
            `).join('');
        });
}

// Fetch all data with delete functionality
if (window.location.pathname.includes('view-data.html')) {
    fetch('/data')
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById('dataList');
            container.innerHTML = data.map(plan => `
                <div>
                    <h2>${plan.destination}</h2>
                    <p>${plan.startDate} - ${plan.endDate}</p>
                    <p>Packing List: ${plan.packingList}</p>
                    <button onclick="deleteRecord(${plan.id})">Delete</button>
                </div>
            `).join('');
        });
}

// Delete a record
function deleteRecord(id) {
    fetch(`/delete/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            alert(result.message);
            location.reload();
        });
}
