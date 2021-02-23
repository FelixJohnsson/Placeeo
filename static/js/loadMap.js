let map;

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};



outputMap(59.3304631,18.0588507);

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
let exist = false;
let placeholder = null;

function outputMap(lat, lng) {

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
            let size = zoom * 4;
            item.style.width = size + 'px';
            item.style.height = size + 'px';
            item.style.backgroundSize = 'cover';
        }
    })
    let marker;
    map.on('click', (e) => {
        if (!exist) {
            let el = document.createElement('div');
            el.className = 'marker';
            el.style.background = '#297373'
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = 'solid white 3px'
            marker = new mapboxgl.Marker(el, {
                    draggable: true
                })
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .addTo(map);
        } else {
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat])
        }
        exist = true;
        placeholder = [e.lngLat.lng, e.lngLat.lat];
    });
}
navigator.geolocation.getCurrentPosition((position) => {
    map.setCenter([position.coords.longitude, position.coords.latitude])
});

//-----------------------PASSWORDS-----------------------//

//-----checkIfPasswordIsRequired-----//
let passwordIsRequired;
checkIfPasswordIsRequired(window.location.href.split('/')[4], (passwordRequired) => {
    if (passwordRequired){
        outputPasswordInput();
    } else {
        outputPasswordSet();
    }
});

function checkPassword(){
    let bool = submitPassword(document.getElementById('password').value).then(data => {
        console.log('PASSWORD IS: ' + data)
        return data
    })
    return bool;
}

getUserImages(window.location.href.split('/')[4]);

