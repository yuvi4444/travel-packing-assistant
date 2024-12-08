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
