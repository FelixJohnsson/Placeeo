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

function redirectDir() {
    window.location.href = "http://localhost:3000/" + document.getElementById('dir').value;
}
data = {
    location: [],
    time: 0,
    date: 0,
    user: 'guest',
    id: 0,
    title: 0,
    description: 0,
    height: 0,
    width: 0
}

function outputMap(lat, lng) {
    data.location = [lng, lat]
    console.log(lng, lat)
    atLocation = [lng, lat]
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhqb2huc3NvbiIsImEiOiJjanh0ZHIwd3kwcjhjM2Rvb2M3ZnVyMW5kIn0.Mdf_WJH-4npMZh3HNu-6wQ';
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/felixjohnsson/ckfvgqi3z0xgv19oalq5pqtjb', // stylesheet location
        center: atLocation, // starting position [lng, lat]
        pitch: 60, // pitch in degrees
        zoom: 13 // starting zoom
    });
    map.on('zoom', () => {
        let list = document.getElementsByClassName('map-markers')
        for (let item of list) {
            let zoom = map.getZoom();
            let size = zoom * 8; 
            item.style.width = size +'px';
            item.style.height = size+'px';
            item.style.backgroundSize = 'cover';
        }
    })
    /*map.on('load', ()=> {
        rotateCamera(0)
        function rotateCamera(timestamp) {
            // clamp the rotation between 0 -360 degrees
            // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
            map.rotateTo((timestamp / 700) % 360, { duration: 0 });
            // Request the next frame of the animation.
            requestAnimationFrame(rotateCamera);
        }
    })*/

}
document.getElementById('file').addEventListener("change", e => {
    var fileList = document.getElementById('file').files;
    var preview = document.getElementById('image-preview');
    preview.src = URL.createObjectURL(fileList[0]);


    var image = new Image();
    image.src = preview.src;
    image.onload = function () {
        data.width = image.naturalWidth;
        data.height = image.naturalHeight;
    }

    preview.onload = () => {
        URL.revokeObjectURL(preview.src)
    }

});

function postData() {
    data.time = Date.now();
    data.date = new Date().toISOString().slice(0, 16);
    data.title = document.getElementById('title').value;
    data.description = document.getElementById('description').value;
    console.log(data)
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

getUserImages(window.location.href.split('/')[4]);

function getUserImages(dir) {

    geojson = {
        'type': 'FeatureCollection',
        'features': [

        ]
    };
    let userID = document.getElementById('dir').value;
    if (dir) {
        userID = window.location.href.split('/')[4];
        data.user = window.location.href.split('/')[4];
        document.getElementById('dir').value = window.location.href.split('/')[4];
    }
    fetch(`/images/${userID}/`)
        .then(res => res.json())
        .then(data => {
            data.forEach(el => {
                console.log(el)
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
                        'description': el.description,
                        'height': el.height,
                        'width': el.width
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


let open = true;

function addMarkers() {
    geojson.features.forEach((marker) => {
        const el = document.createElement('div');
        el.className = 'map-markers'
        
        el.style.backgroundImage =
            `url(/images/${marker.properties.username}/${marker.properties.img})`
        el.style.backgroundSize = 'cover';
        let location = marker.properties.location;
        let widthDim = marker.properties.width / marker.properties.height;
        let newHeight = marker.properties.height;
        let newWidth = marker.properties.width;
        if (newHeight > 500) {
            newHeight -= (marker.properties.height - 500)
            newWidth -= (marker.properties.height - 500) * widthDim;
        }
        el.id = `${newHeight}-${newWidth}`;

        el.addEventListener('click', () => {
            if (open) {
                el.style.width = newWidth + 'px';
                el.style.height = newHeight + 'px';
                el.style.backgroundSize = `cover`;
                el.style.zIndex = '2';
                el.style.opacity = '100%';
                el.style.borderRadius = '0%';
                el.classList.add('marker-active');
                open = false;
            } else if (!open) {
                el.classList.remove('marker-active');
                el.style.width = '106px';
                el.style.height = '106px';
                el.style.backgroundSize = `cover`;
                el.style.zIndex = '1';
                el.style.opacity = '100%';
                el.style.borderRadius = '50%';
                open = true;
            }

        });
        let allMapMarkers = []
        // add marker to map
        allMapMarkers.push(new mapboxgl.Marker(el, {
                draggable: true
            })
            .setLngLat(location)
            .addTo(map));
        allMapMarkers[0].on('dragend', (el) => {
            let url = el.target._element.style.backgroundImage.split('/')
            console.log(url[3].slice(0, -2))
            fetch(`/move/${url[2]}/${url[3].slice(0,-2)}/${el.target._lngLat.lng}-${el.target._lngLat.lat}`)
                .then(data => {
                    console.log(data)
                })
        })

    });
}