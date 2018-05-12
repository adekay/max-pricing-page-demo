function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {
            lat: 6.501646,
            lng: 3.376644
        },
        zoom: 13
    });

    new AutocompleteDirectionsHandler(map);
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlace = null;
    this.destinationPlace = null;
    this.travelMode = 'DRIVING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {
            placeIdOnly: false
        });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {
            placeIdOnly: false
        });

    //            this.setupClickListener('changemode-walking', 'WALKING');
    //            this.setupClickListener('changemode-transit', 'TRANSIT');
    //            this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    //        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    //        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    //        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
//        AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
//            var radioButton = document.getElementById(id);
//            var me = this;
//            radioButton.addEventListener('click', function() {
//                me.travelMode = mode;
//                me.route();
//            });
//        };

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }

        if (mode === 'ORIG') {
            me.originPlace = place;
        } else {
            me.destinationPlace = place;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlace || !this.destinationPlace) {
        return;
    }
    var me = this;

    getPrice(this.originPlace.geometry.location, this.destinationPlace.geometry.location);

    this.directionsService.route({
        origin: {
            'placeId': this.originPlace.place_id
        },
        destination: {
            'placeId': this.destinationPlace.place_id
        },
        travelMode: this.travelMode
    }, function (response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

var getPrice = function (a, b) {
    var request = new XMLHttpRequest();

    request.open('POST', 'https://sandbox.max.ng/v1/pricings/estimate');

    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'pubpk_3d09363bee3e8be31316ab34886b779d19f7ffb7da53793638e696887dddc9d8lic_key');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            //console.log('Status:', this.status);
            //console.log('Headers:', this.getAllResponseHeaders());
            //console.log('Body:', this.responseText);
            //console.log('json:', JSON.parse(this.responseText));
            document.getElementById('value').innerHTML = JSON.parse(this.responseText).data.delivery_fee;
        }
    };

    var body = {
        'pickup': {
            'lat': a.lat(),
            'lng': a.lng()
        },
        'delivery': {
            'lat': b.lat(),
            'lng': b.lng()
        },
        'service_id': 'e6f9a0b7-8f03-431f-a3da-7fbc914bbb72'
    };

    request.send(JSON.stringify(body));

}
