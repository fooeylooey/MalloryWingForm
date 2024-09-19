document.addEventListener("DOMContentLoaded", function () {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCSG_1rEWxmQnqQzwgpyqYi8NM-aWQ-Ik4",
        authDomain: "mallorywingform.firebaseapp.com",
        projectId: "mallorywingform",
        storageBucket: "mallorywingform.appspot.com",
        messagingSenderId: "109860416825",
        appId: "1:109860416825:web:f8831a534cb19dca088ce8",
        measurementId: "G-EL727G8DNM"
      };

    // Initialize Firebase only if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize Firestore and Auth
    const db = firebase.firestore();
    const auth = firebase.auth();

    let wingChart = null;
    let wingPlaces = [];

    // Authentication: Sign In with Google
    document.getElementById('signInButton').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then((result) => {
            console.log('Signed in:', result.user.email);
        }).catch((error) => {
            console.error('Error signing in:', error);
        });
    });

    // Authentication: Sign Out
    document.getElementById('signOutButton').addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('Signed out');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });

    // Update the UI based on the user's authentication state
    auth.onAuthStateChanged((user) => {
        const userStatus = document.getElementById('userStatus');
        const signInButton = document.getElementById('signInButton');
        const signOutButton = document.getElementById('signOutButton');
        const submitFormSection = document.getElementById('submit-form');

        if (user) {
            userStatus.innerText = `Signed in as: ${user.email}`;
            signInButton.style.display = 'none';
            signOutButton.style.display = 'block';
            submitFormSection.style.display = 'block';  // Show the form
        } else {
            userStatus.innerText = 'Not signed in';
            signInButton.style.display = 'block';
            signOutButton.style.display = 'none';
            submitFormSection.style.display = 'none';  // Hide the form
        }
    });

    // Load wing places into the dropdown dynamically
    function loadWingPlaces() {
        const dropdown = document.getElementById('place-name');
        db.collection("wingPlaces").get().then((querySnapshot) => {
            dropdown.innerHTML = '';  // Clear existing options
            querySnapshot.forEach((doc) => {
                const place = doc.data();
                const option = document.createElement('option');
                option.value = place.name;
                option.textContent = `${place.name} (${place.location})`;
                dropdown.appendChild(option);
            });
        }).catch((error) => {
            console.error("Error loading wing places: ", error);
        });
    }

    // Fetch top 5 wing places and update the chart
    function getTopWingPlaces() {
        db.collection("wingPlaces")
            .orderBy("avgRating", "desc")
            .limit(5)
            .get()
            .then((querySnapshot) => {
                wingPlaces = [];
                querySnapshot.forEach((doc) => {
                    wingPlaces.push(doc.data());
                });
                updateChart();
            })
            .catch((error) => {
                console.error("Error fetching top wing places: ", error);
            });
    }

    // Function to update the chart with wing places data
    function updateChart() {
        const ctx = document.getElementById('wing-chart').getContext('2d');

        // Destroy previous chart if it exists
        if (wingChart !== null) {
            wingChart.destroy();
        }

        // Create a new chart
        wingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: wingPlaces.map((place) => place.name),
                datasets: [{
                    label: 'Average Rating',
                    data: wingPlaces.map((place) => place.avgRating),
                    backgroundColor: 'rgba(255, 127, 80, 0.8)',
                    borderColor: 'rgba(255, 99, 71, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }

    // Handle form submission to submit a rating for a wing place
    document.getElementById('wingForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const placeName = document.getElementById('place-name').value;
        const placeRating = parseFloat(document.getElementById('place-rating').value);

        if (placeRating < 1 || placeRating > 5) {
            alert("Please provide a rating between 1 and 5.");
            return;
        }

        // Check if the wing place exists in Firestore
        db.collection("wingPlaces").doc(placeName).get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                // Update the wing place with a new rating
                const data = docSnapshot.data();
                const newNumRatings = data.numRatings + 1;
                const newCumulativeRating = data.cumulativeRating + placeRating;
                const newAvgRating = newCumulativeRating / newNumRatings;

                db.collection("wingPlaces").doc(placeName).update({
                    numRatings: newNumRatings,
                    cumulativeRating: newCumulativeRating,
                    avgRating: newAvgRating
                }).then(() => {
                    console.log("Wing place rating updated successfully!");
                    getTopWingPlaces();  // Refresh the chart with updated data
                }).catch((error) => {
                    console.error("Error updating wing place: ", error);
                });
            } else {
                alert("Selected wing place does not exist.");
            }
        }).catch((error) => {
            console.error("Error fetching wing place: ", error);
        });
    });

    // Initial load of wing places and top places
    loadWingPlaces();
    getTopWingPlaces();
});
