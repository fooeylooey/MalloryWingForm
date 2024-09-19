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
    
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    
        // Initialize Firestore and Auth
        const db = firebase.firestore();
        const auth = firebase.auth();
    
        // Google Maps Autocomplete for Location
        const locationInput = document.getElementById('place-location');
        const autocomplete = new google.maps.places.Autocomplete(locationInput);
    
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
    
        // Handle authentication state changes
        auth.onAuthStateChanged((user) => {
            const userStatus = document.getElementById('userStatus');
            const signInButton = document.getElementById('signInButton');
            const signOutButton = document.getElementById('signOutButton');
            const addPlaceForm = document.getElementById('add-place-form');
    
            if (user) {
                userStatus.innerText = `Signed in as: ${user.email}`;
                signInButton.style.display = 'none';
                signOutButton.style.display = 'block';
                addPlaceForm.style.display = 'block';  // Show form if authenticated
            } else {
                userStatus.innerText = 'Not signed in';
                signInButton.style.display = 'block';
                signOutButton.style.display = 'none';
                addPlaceForm.style.display = 'none';  // Hide form if not authenticated
            }
        });
    
        // Handle form submission to add a new wing place
        document.getElementById('newPlaceForm').addEventListener('submit', function (e) {
            e.preventDefault();
    
            const placeName = document.getElementById('place-name').value;
            const placeLocation = document.getElementById('place-location').value;
    
            // Ensure user is authenticated
            const user = auth.currentUser;
            if (user) {
                // Add the new wing place to Firestore
                db.collection("wingPlaces").doc(placeName).set({
                    name: placeName,
                    location: placeLocation,
                    numRatings: 0,
                    cumulativeRating: 0,
                    avgRating: 0
                }).then(() => {
                    alert("New wing place added successfully!");
                    window.location.href = "index.html";  // Redirect to main page
                }).catch((error) => {
                    console.error("Error adding wing place:", error);
                });
            } else {
                alert("You must be signed in to add a wing place.");
            }
        });
    });
    