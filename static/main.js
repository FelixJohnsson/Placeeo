let map;

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}
navigator.geolocation.getCurrentPosition((position) => {
    outputMap(position.coords.latitude, position.coords.longitude);
});
data = {
    location: [],
    time: 0,
    date: 0,
    user: 'Felix',
    id: 0,
    title: 0,
    description: 0
}

function outputMap(lat, lng) {
    data.location = [lng, lat]
    console.log(lng, lat)
    atLocation = [lng, lat]
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhqb2huc3NvbiIsImEiOiJjanh0ZHIwd3kwcjhjM2Rvb2M3ZnVyMW5kIn0.Mdf_WJH-4npMZh3HNu-6wQ';
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/felixjohnsson/ckfsch6tp0kak1apkuo2h5vh9', // stylesheet location
        center: atLocation, // starting position [lng, lat]
        pitch: 60, // pitch in degrees
        zoom: 13 // starting zoom
    });
    getUserImages();
    map.on('zoom', () => {
        let list = document.getElementsByClassName('map-markers')
        for (let item of list) {
            
            let zoom = map.getZoom();
            let size = zoom * 6 + 'px'; 
            item.style.width = size;
            item.style.height = size;
            item.style.backgroundSize = `${size} ${size}`
        }
    })
}

function postData() {
    data.time = Date.now();
    data.date = new Date().toISOString().slice(0, 16);
    data.title = document.getElementById('title').value;
    data.description = document.getElementById('description').value;
    fetch('/imageData', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data)
    });
}


let atLocation;
let markers;
var geojson = {
    'type': 'FeatureCollection',
    'features': [

    ]
};

function getUserImages() {
    geojson = {
        'type': 'FeatureCollection',
        'features': [

        ]
    };
    let userID = document.getElementById('userID').innerHTML;
    fetch(`/images/${userID}/`)
        .then(res => res.json())
        .then(data => {
            data.forEach(el => {
                //REDO DATE
                let dateData = el.date.split('-')
                let date = `${dateData[0]}-${dateData[1]}-${dateData[2].split('T')[0]} at ${dateData[2].split('T')[1]}:${dateData[3]}`
                let location = [el.location.split('-')[0], el.location.split('-')[1]]
                let newGeoJSONData = {
                    'type': 'Feature',
                    'properties': {
                        'message': `Date: ${date} GMT+0.`,
                        'img': el.id,
                        'location': location,
                        'username': el.username,
                        'title': el.title,
                        'description': el.description
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': location
                    }
                }
                geojson.features.push(newGeoJSONData);
            })
            addMarkers();
        })
}



function addMarkers() {
    geojson.features.forEach((marker) => {
        const el = document.createElement('div');
        el.className = 'map-markers'
        el.style.backgroundImage =
            `url(/images/${marker.properties.username}/${marker.properties.img})`
        let location = marker.properties.location;
        let open = false;
        let zoom = map.getZoom();
        el.addEventListener('click', () => {
            if (!open) {
                let size = zoom * 16 + 'px'; 
                el.style.width = size;
                el.style.height = size;
                el.style.backgroundSize = `${size} ${size}`
                el.style.zIndex = '1000';
                el.style.opacity = '100%';
                el.style.borderRadius = '0%';
                open = true;
            } else if (open) {
                let size = zoom * 6 + 'px'; 
                el.style.width = size;
                el.style.height = size;
                el.style.backgroundSize = `${size} ${size}`
                el.style.zIndex = '1'
                el.style.opacity = '70%';
                el.style.borderRadius = '50%';
                open = false;
            }
            el.on('dragend', (el) => {
                console.log(el);
            })
        });
        let allMapMarkers = []
        // add marker to map
        allMapMarkers.push(new mapboxgl.Marker(el, {
            draggable: true
        })
            .setLngLat(location)
            .setPopup(new mapboxgl.Popup({
                    offset: 50
                }) // add popups
            .setHTML(`
            <p>${marker.properties.title}</p>
            <p>${marker.properties.description}</p>
            `))
            .addTo(map));
            allMapMarkers[0].on('dragend', (el) => {
                let url = el.target._element.style.backgroundImage.split('/')
                console.log(url[3].slice(0,-2))
                fetch(`/move/${url[2]}/${url[3].slice(0,-2)}/${el.target._lngLat.lng}-${el.target._lngLat.lat}`)
                .then(data => {
                    console.log(data)
                })
            })

    });
}

