import React, { useEffect } from "react";
import "./Google_Maps.module.css";

function Google_Maps() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places&callback=initMap`;
    script.defer = true;

    window.initMap = function() {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 31.5204, lng: 74.3587 },
        zoom: 8,
      });

      const originInput = document.getElementById("origin-input");
      const destinationInput = document.getElementById("destination-input");
      const waypointsInput = document.getElementById("waypoints-input");

      const originAutocomplete = new window.google.maps.places.Autocomplete(
        originInput
      );
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(
        destinationInput
      );
      const waypointsAutocomplete = new window.google.maps.places.Autocomplete(
        waypointsInput
      );

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();

      const infowindow = new window.google.maps.InfoWindow();
      const service = new window.google.maps.places.PlacesService(map);

      directionsRenderer.setMap(map);

      document
        .getElementById("submit-btn")
        .addEventListener("click", function() {
          const origin = document.getElementById("origin-input").value;
          const destination = document.getElementById("destination-input")
            .value;
          const waypoints = document
            .getElementById("waypoints-input")
            .value.split("|");

          const waypointsArray = [];
          if (waypoints[0]) {
            for (let i = 0; i < waypoints.length; i++) {
              waypointsArray.push({
                location: waypoints[i],
                stopover: true,
              });
            }
          }

          directionsService.route(
            {
              origin: origin,
              destination: destination,
              waypoints: waypointsArray,
              optimizeWaypoints: true,
              travelMode: "DRIVING",
            },
            function(response, status) {
              if (status === "OK") {
                directionsRenderer.setDirections(response);

                // Get all the points on the route
                const points = response.routes[0].overview_path;

                // Loop through each point and search for nearby places
                for (let i = 0; i < points.length; i++) {
                  const request = {
                    location: points[i],
                    radius: 30000, // 30km
                    type: ["locality"], // Only search for cities
                  };

                  // Use the PlacesService to search for nearby cities
                  service.nearbySearch(request, function(results, status) {
                    if (
                      status ===
                      window.google.maps.places.PlacesServiceStatus.OK
                    ) {
                      for (let j = 0; j < results.length; j++) {
                        const place = results[j];
                        const marker = new window.google.maps.Marker({
                          position: place.geometry.location,
                          map: map,
                        });

                        // Add a click event listener to the marker to display the city's name in an infowindow
                        window.google.maps.event.addListener(
                          marker,
                          "click",
                          function() {
                            infowindow.setContent(place.name);
                            infowindow.open(map, marker);
                          }
                        );
                      }
                    }
                  });
                }
              } else {
                alert(
                  "There was an error with the directions service. Please try again later."
                );
              }
            }
          );
        });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window.initMap;
    };
  }, []);

  return (
    <>
      <div>
        <label htmlFor="origin-input">Origin:</label>
        <input type="text" id="origin-input" />
      </div>
      <div>
        <label htmlFor="destination-input">Destination:</label>
        <input type="text" id="destination-input" />
      </div>
      <div>
        <label htmlFor="waypoints-input">Waypoints:</label>
        <input type="text" id="waypoints-input" />
        <p>
          Enter multiple waypoints separated by '|', e.g.
          "Faisalabad|Lahore|Islamabad"
        </p>
      </div>
      <button className="btn btn-success" id="submit-btn">
        Submit
      </button>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
      <ul id="cities-list"></ul>
    </>
  );
}

export default Google_Maps;
