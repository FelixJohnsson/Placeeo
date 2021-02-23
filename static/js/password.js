async function isPasswordRequired(dir){
    let status = null;
    
    await fetch(`/check-password/${dir}`, {
        method:'GET'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if (data.msg === 'PASSWORD PROTECTED'){
            status = true;
            return status;
        }
        if (data.msg === 'NOT PASSWORD PROTECTED'){
            status = false;
            return status;
        }
    })
    return status
}
async function checkIfPasswordIsRequired(dir,_callback) {
    let res = await isPasswordRequired(dir);
    _callback(res)
}
function outputPasswordInput(){
    console.log('INSERT PASSWORD')
    document.getElementById('password-protected').style.display = 'block';
    document.getElementById('submit-password-button').style.display = 'block';

    document.getElementById('not-password-protected').style.display = 'none';
    document.getElementById('dir-protected').style.display = 'none'
    document.getElementById('set-password-button').style.display = 'none'
}

function outputPasswordSet(){
    console.log('INSERT SET PASSWORD')
    document.getElementById('password-protected').style.display = 'none';
    document.getElementById('dir-protected').style.display = 'none';
    document.getElementById('submit-password-button').style.display = 'none';

    document.getElementById('not-password-protected').style.display = 'block';
    document.getElementById('set-password-button').style.display = 'block'
}



//-----submitPassword-----//

async function submitPassword(){
    
    password = document.getElementById('password').value
    if (password.length < 1){
        password = null;
    }
    console.log(password)
    let res = await fetch(`/control-password/${window.location.href.split('/')[4]}/${password}`, {
        method:'GET'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if(data.msg === 'PASSWORD IS NOT CORRECT'){
            document.getElementById('password').style.border = 'solid red 3px';
            return false;
        }
        if(data.msg === 'PASSWORD IS CORRECT' || data.msg === 'PASSWORD IS NOT REQUIRED'){
            document.getElementById('password').style.border = 'solid green 3px';
            return true;
        }
    })
    
    return res;
}

async function setPasswordOnDir() {
let dir = window.location.href.split('/')[4];
    reqBody = {
        dir: dir,
        password: document.getElementById('password').value
    }
    fetch(`/set-password`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(reqBody)
    }).then(() => {
        checkIfPasswordIsRequired(window.location.href.split('/')[4], (passwordRequired) => {
            if (passwordRequired){
                outputPasswordInput();
            } else {
                outputPasswordSet();
            }
        });
    });

}