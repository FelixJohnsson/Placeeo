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

            data.forEach(el => {
                if (el.date === undefined) return;
                let dateData = el.date.split('-')
                let date = `${dateData[0]}-${dateData[1]}-${dateData[2].split('T')[0]} at ${dateData[2].split('T')[1]}:${dateData[3]}`
                let location = [el.location.split('-')[0], el.location.split('-')[1]]
                data.width = el.width;
                data.height = el.height;

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
                        'width': el.width,
                        'status': el.status
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
        console.log(marker.properties)
        if (marker.properties.status.alive === "true"){
            el.style.border = "solid #56b35b 6px"
        }
        if (marker.properties.status.alive === "false"){
            el.style.border = "solid #cc4040 6px"
        }
        el.id = `${newHeight}-${newWidth}`;
        const titleP = document.createElement('P');
        let titleText = document.createTextNode("Title: " + marker.properties.title);

        const statusP = document.createElement('P');
        if(marker.properties.status.alive === "true"){
            var statusText = document.createTextNode("Status: Active");
            statusP.style.color = "#56b35b";
        } else if(marker.properties.status.alive === "false"){
            var statusText = document.createTextNode("Status: Inactive");
            statusP.style.color = "#cc4040";
        }
        console.log(marker.properties.status.alive)
        statusP.appendChild(statusText);
        statusP.classList.add('marker-text-status');

        titleP.appendChild(titleText)
        titleP.classList.add('marker-text');
        el.addEventListener('click', () => {
            if (open) {

                el.style.width = newWidth + 'px';
                el.style.height = newHeight + 'px';
                el.style.backgroundSize = `cover`;
                el.style.zIndex = '12';
                el.style.opacity = '100%';
                el.style.borderRadius = '0%';
                el.classList.add('marker-active');

                el.appendChild(titleP)
                el.appendChild(statusP)
                open = false;
            } else if (!open) {
                el.removeChild(titleP)
                el.removeChild(statusP)
                el.classList.remove('marker-active');
                let zoom = map.getZoom();
                let size = zoom * 4;
                el.style.width = size + 'px';
                el.style.height = size + 'px';
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
            
            const check = async (dir,_callback) => {
                let res = await submitPassword(dir);
                _callback(res)
            }
        
            check(window.location.href.split('/')[4], (data)=> {

                if(data){
                    let password = document.getElementById('password').value;
                    if (password.length < 1) password = null;
                    
                    fetch(`/move/${url[2]}/${url[3].slice(0,-2)}/${el.target._lngLat.lng}-${el.target._lngLat.lat}/${password}`)
                } else {
                    alert('You need to enter a password to move markers.')
                }
            })

        })

    });
}