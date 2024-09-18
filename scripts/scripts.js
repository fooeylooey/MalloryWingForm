document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();

    let wingPlaces = [];
    let wingChart;

    // Function to fetch top 5 wing places from Firestore
    function getWingPlaces() {
        db.collection("wingPlaces")
            .orderBy("rating", "desc")
            .limit(5)
            .get()
            .then((querySnapshot) => {
                wingPlaces = [];
                querySnapshot.forEach((doc) => {
                    wingPlaces.push(doc.data());
                });
                updateChart();
            });
    }

    // Function to update the chart with new data

    function updateChart() {
        const ctx = document.getElementById('wing-chart').getContext('2d');
    
        // Destroy the previous chart if it exists
        if (wingChart) {
            wingChart.destroy();
        }
    
        // Create the new chart
        wingChart = new Chart(ctx, {
            type: 'bar', // Use 'bar' instead of 'horizontalBar'
            data: {
                labels: wingPlaces.map((place) => place.name),
                datasets: [{
                    label: 'Ratings',
                    data: wingPlaces.map((place) => place.rating),
                    backgroundColor: 'rgba(255, 127, 80, 0.8)',
                    borderColor: 'rgba(255, 99, 71, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // This makes the bar chart horizontal
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }    
    

    // Fetch initial data when the page loads
    getWingPlaces();

    // Handle form submission to store data in Firestore
    document.getElementById('wingForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const placeName = document.getElementById('place-name').value;
        const placeRating = parseFloat(document.getElementById('place-rating').value);

        // Add new wing place to Firestore
        db.collection("wingPlaces").add({
            name: placeName,
            rating: placeRating
        })
            .then(() => {
                console.log("Wing place added!");
                getWingPlaces(); // Refresh data after submission
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    });
});
