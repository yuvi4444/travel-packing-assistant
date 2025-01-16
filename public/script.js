let selectedDestination = ""; // Variable to store the destination name
let latLng = null; // Variable to store the latitude and longitude
let selectedLat, selectedLon;

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
        selectedLat = latLng.lat();
        selectedLon = latLng.lng();
        console.log('Selected Location:', selectedLat, selectedLon);
        
        // Reverse geocode the lat/lng to get a place name
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
                selectedDestination = results[0].formatted_address; // Save the place name
                console.log("Selected address:", selectedDestination); // Display in console
                // console.log("Destination:", results[0].address_components[2].long_name + ", " + results[0].address_components[3].long_name + ", " + results[0].address_components[4].long_name);
                console.log("Suburb Destination:", results[0].address_components);

                let locality =  "", area = "", state = "";
                results[0].address_components.forEach(element => {
                    if(element.types.includes("locality") || element.types.includes("locality")){
                        locality = element.long_name;
                    }
                    if(element.types.includes("administrative_area_level_2")){
                        area = element.long_name;
                    }
                    if(element.types.includes("administrative_area_level_1")){
                        state = element.long_name;
                    }
                });
                console.log("short address: " + locality + ", " + area + ", " + state);
                alert(`Selected Destination: ${selectedDestination}`);
                // fetchWeather(latLng.lat(), latLng.lng()); // Fetch weather for selected location
            } else {
                console.error("Geocoder failed due to:", status);
            }
        });
    });
}

async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        console.log('Weather Data:', data);
        return {
            weather: data.weather[0].description,
            temperature: data.main.temp
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            weather: 'Unavailable',
            temperature: null
        };
    }
}


// Handle form submission
document.getElementById('travelForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    // Convert string dates to Date objects for accurate comparison on multiple days
    // var startDate = new Date(formData.startDate);
    // var endDate = new Date(formData.endDate);
    // if (startDate > endDate){
    //     alert("Please enter valid date range!");
    //     return;
    // }
    // else {
    //     let days = (endDate-startDate)/(1000 * 60 * 60 * 24);
    //     console.log("number of days: " + days);
    // };

    // Dynamic latitude and longitude
    const lat = selectedLat;
    const lon = selectedLon;

    // Fetch weather data
    const { weather, temperature } = await fetchWeather(lat, lon);
        
    const additionalInfo = {
        lat,
        lon,
        weather,
        temperature
    };

    const completeData = { ...formData, ...additionalInfo};

    const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData)
    });
    const result = await response.json();
    alert(result.message);
    if (result.packingList) {
        window.location.href = 'packing-list.html';
    }
});

function formatDate(dateString) {
    return new Date(dateString).toISOString().split('T')[0]; // Extracts only the date part
}

// Fetch packing list
if (window.location.pathname.includes('packing-list.html')) {
    fetch('/data')
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById('packingList');
            
            container.innerHTML = data.map(plan => {
                const formattedStartDate = formatDate(plan.startDate);
                const formattedEndDate = formatDate(plan.endDate);
                
                // Generate HTML for each plan
                return `
                    <div>
                        <h2>${plan.destination}</h2>
                        <p>${formattedStartDate} - ${formattedEndDate}</p>
                        <p>Packing List: ${plan.packingList}</p>
                    </div>
                `;
            }).join('');
        });
}


// Fetch all data with delete functionality
if (window.location.pathname.includes('view-data.html')) {
    fetch('/data')
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById('dataList');
            if (!container) {
                console.error('Container element not found');
                return;
            }
            
            container.innerHTML = data.map(plan => {
                const formattedStartDate = formatDate(plan.startDate);
                const formattedEndDate = formatDate(plan.endDate);
                
                return `
                    <div>
                        <h2>${plan.destination}</h2>
                        <p>${formattedStartDate} - ${formattedEndDate}</p>
                        <p>Packing List: ${plan.packingList}</p>
                        <button onclick="deleteRecord(${plan.id})">Delete</button>
                    </div>
                `;
            }).join('');
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
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
