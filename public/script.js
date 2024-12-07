document.getElementById('packingForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const weather = document.getElementById('weather').value;
    const activities = document.getElementById('activities').value;

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination, startDate, endDate, weather, activities })
    })
        .then(response => response.json())
        .then(data => {
            // Redirect to output page and pass data dynamically
            localStorage.setItem('packingList', JSON.stringify(data));
            window.location.href = 'output.html';
        })
        .catch(error => console.error('Error:', error));
});

// For output.html: Load packing list from localStorage
if (window.location.pathname.includes('output.html')) {
    const packingList = JSON.parse(localStorage.getItem('packingList'));
    const listDiv = document.getElementById('packingList');
    listDiv.innerHTML = '<ul>' + packingList.map(item => `<li>${item}</li>`).join('') + '</ul>';
}
