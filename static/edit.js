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
            let size = zoom * 8;
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
    let fileList = document.getElementById('file').files;
    let preview = document.getElementById('image-preview');
    preview.src = URL.createObjectURL(fileList[0]);


    let image = new Image();
    image.src = preview.src;
    image.onload = function () {
        data.width = image.naturalWidth;
        data.height = image.naturalHeight;
    }

    preview.onload = () => {
        URL.revokeObjectURL(preview.src)
        preview.height = '300px';
    }

});

let atLocation;
let markers;
let geojson = {
    'type': 'FeatureCollection',
    'features': [

    ]
};

function submitPassword() {
    let password = document.getElementById('password').value;
    checkPassword(password);
}

function checkPassword(password) {
    fetch(`/checkPassword`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({
                password: password
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data) {
                document.getElementById('correct-password').style.display = 'block';
                document.getElementById('incorrect-password').style.display = 'none';
            } else {
                document.getElementById('incorrect-password').style.display = 'block';
                document.getElementById('correct-password').style.display = 'none';
            }
        })
}

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
            if (data.status === 'Empty') {
                document.getElementById('status').innerHTML = 'This dir is empty'
                document.getElementById('password').style.display = 'none';
                return;
            }
            document.getElementById('password').style.display = 'block';
            document.getElementById('submit-password-button').style.display = 'block';
            data.forEach(el => {
                if (el.date === undefined) return;
                let dateData = el.date.split('-')
                let date = `${dateData[0]}-${dateData[1]}-${dateData[2].split('T')[0]} at ${dateData[2].split('T')[1]}:${dateData[3]}`
                let location = [el.location.split('-')[0], el.location.split('-')[1]]
                let newGeoJSONData = {
                    'type': 'Feature',
                    'properties': {
                        'message': `Date: ${date} GMT+0.`,
                        'img': el.dir,
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
            document.getElementById('status').innerHTML = 'This dir has data.'
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
        const p = document.createElement('P');
        let t = document.createTextNode(marker.properties.title);
        p.appendChild(t)
        p.classList.add('marker-text');
        el.addEventListener('click', () => {
            if (open) {
                el.style.width = newWidth + 'px';
                el.style.height = newHeight + 'px';
                el.style.backgroundSize = `cover`;
                el.style.zIndex = '2';
                el.style.opacity = '100%';
                el.style.borderRadius = '0%';
                el.classList.add('marker-active');

                el.appendChild(p)
                open = false;
            } else if (!open) {
                el.removeChild(p)
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
            fetch(`/move/${url[2]}/${url[3].slice(0,-2)}/${el.target._lngLat.lng}-${el.target._lngLat.lat}`)
        })

    });
}

function claimDir() {
    console.log('CLAIMING DIR')
    reqBody = {
        dir: window.location.href.split('/')[4],
        password: document.getElementById('dir-password').value
    }

    fetch(`/claimDir`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(reqBody)
    });
}

const inputElement = document.getElementById("file");


document.getElementById('file').addEventListener('change', event => {
    preview(event);
})
const preview = event => {
    files = event.target.files
    let preview = document.getElementById('image-preview');
    preview.src = URL.createObjectURL(files[0]);
    preview.onload = () => {
        URL.revokeObjectURL(preview.src)
        preview.style.height = '106px';
        preview.style.backgroundSize = `cover`;
        preview.style.zIndex = '1';
        preview.style.opacity = '100%';
        preview.style.borderRadius = '50%';
    }
}
function uploadImageAndData(){

    if(!password && password !== null){
        document.getElementById('dir-protected').style.display = 'block'
        return;
    }
    const formData = new FormData()
    formData.append('image', files[0])

imageData = {
    username: window.location.href.split('/')[4],
    location: placeholder,
    time: Date.now(),
    date: new Date().toISOString().slice(0, 16),
    title: document.getElementById('title').value,
    password: password
}
if (placeholder === null) imageData.location = atLocation;
fetch('/upload-image-data', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch(error => {
        console.error(error)
    })
fetch('/upload-image-file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        map.remove();
        outputMap(imageData.location[1], imageData.location[0]);
        getUserImages(window.location.href.split('/')[4]);
    })
    .catch(error => {
        console.error(error)
    })
    
}

let password = null;
function submitPassword(){
    fetch(`/check-password/${window.location.href.split('/')[4]}/${password = document.getElementById('password').value}`, {
        method:'GET'
    })
    .then(res => res.json())
    .then(data => {
        if(data.msg === 'PASSWORD IS NOT CORRECT'){
            document.getElementById('password').style.borderColor = 'red';
        }
        if(data.msg === 'PASSWORD IS CORRECT'){
            document.getElementById('password').style.borderColor = 'green';
            password = true;
        }
    })
}

function passwordHandler(){
    fetch(`/check-password/${window.location.href.split('/')[4]}`, {
        method:'GET'
    })
    .then(res => res.json())
    .then(data => {
        if (data.msg === 'PASSWORD PROTECTED'){
            document.getElementById('password-protected').style.display = 'block';
            document.getElementById('not-password-protected').style.display = 'none';
            document.getElementById('dir-protected').style.display = 'none'
        }
        if (data.msg === 'PASSWORD PROTECTED'){
            document.getElementById('password-protected').style.display = 'none';
            document.getElementById('not-password-protected').style.display = 'block';
            document.getElementById('dir-protected').style.display = 'none'
        }
    })
}

passwordHandler();