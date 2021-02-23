const inputElement = document.getElementById("file");
let imageRes = {
    height:null,
    width:null
}
document.getElementById('file').addEventListener('change', event => {
    preview(event);
})
const preview = event => {
    files = event.target.files
    let preview = document.getElementById('image-preview');
    preview.src = URL.createObjectURL(files[0]);

    let image = new Image();
    image.src = preview.src;
    image.onload = function () {
        URL.revokeObjectURL(preview.src)
        imageRes.width = image.naturalWidth;
        imageRes.height = image.naturalHeight;
    }


}
function uploadImageAndData(){
    
    
    const check = async (dir,_callback) => {
        let res = await submitPassword(dir);
        _callback(res)
    }
    
    check(window.location.href.split('/')[4], (data)=> {
        if (!data){ document.getElementById('password').style.border = 'solid red 3px'; return;}
        if (placeholder === null){alert('Put down a marker where you want to place the image.'); return;}
        if (data){
            const formData = new FormData()
            formData.append('image', files[0])
        
        imageData = {
            username: window.location.href.split('/')[4],
            location: placeholder,
            time: Date.now(),
            date: new Date().toISOString().slice(0, 16),
            title: document.getElementById('title').value,
            height: imageRes.height,
            width: imageRes.width,
            status: {
                alive:true
            }
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
                map.remove();
                outputMap(imageData.location[1], imageData.location[0]);
                getUserImages(window.location.href.split('/')[4]);
                exist = false;
            })
            .catch(error => {
                console.error(error)
            })
        }
        })


}
