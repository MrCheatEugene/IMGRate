document.addEventListener('deviceready', onDeviceReady, false);
window.scores = {};
const loadratings = ()=>{
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function success(fileEntry) {
        fileEntry.getFile("rates.txt", { create: true, exclusive: false }, function (fileEntry) {
        fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            let r = this.result;
            try{
                window.scores = JSON.parse(r);
            }catch(e){
                window.scores = {};
                savescores();
            }
        };
        reader.readAsText(file);
    }, ()=>{});         
    }, ()=>{});
    });
}

const savescores = ()=>{
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function success(fileEntry) {
            fileEntry.getFile("rates.txt", { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
            let dataObj = new Blob([JSON.stringify(window.scores)], { type: 'text/plain' });
            fileWriter.write(dataObj);
        }, ()=>{});    
        }, ()=>{});
    });
}

let crating = '';
const rateimg = (path)=>{
    crating = path;
    if(Object.keys(window.scores).includes(path)){
        document.getElementById('star-'+(window.scores[path].toString())).click();
    }
    document.getElementById('ratingsrc').src = path;
    document.getElementById('main').classList.add('d-none');
    document.getElementById('rating').classList.remove('d-none');
}


const ratecurrent = ()=>{
    let ins = document.getElementsByTagName("input");
    for (let index = 0; index < ins.length; index++) {
        if(ins[index].checked){
            let score = ins[index].id.split('-')[1];
            window.scores[crating]=parseInt(score);
            savescores();
            document.getElementById('rating').classList.add('d-none');
            document.getElementById('main').classList.remove('d-none');
        }
    }
    
}

const loaddir = (path)=>{
    document.getElementById('images').innerHTML = '';
    window.resolveLocalFileSystemURL(path, function(dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(function(entries) {
            entries.forEach(function(entry) {
                if(entry.name.endsWith(".png") || entry.name.endsWith(".jpg")|| entry.name.endsWith(".jpeg")){
                    window.resolveLocalFileSystemURL(entry.nativeURL, function success(fileEntry) {
                        document.getElementById('images').innerHTML+=`
                <div style="width: 35vw;" onclick="rateimg('${fileEntry.toInternalURL()}')">
                <img style="max-width: 90%; height: auto;" src="${fileEntry.toInternalURL()}">
                <p>${entry.name}</p>
                </div>    
                `;
                    }, (e)=>{console.log(e)});
                }
            });
        }, function(error) {
            console.error('Error reading directory: ' + error.code);
        });
    }, function(error) {
        console.error('Error resolving directory URL: ' + error.code);
    });
}

const picker = ()=>{
    window.plugins.intentShim.startActivityForResult(
        {
            action: "android.intent.action.OPEN_DOCUMENT_TREE",
            extras: {
                "INITIAL_URI": "/sdcard/"
            }
        },
        function(intent) { 
            let path = `file:///sdcard/${decodeURIComponent(intent.data).split(":")[2]}`;
            console.log(path);
            loaddir(path);
        },
        function() {
            window.plugins.intentShim.startActivityForResult(
                {
                    action: window.plugins.intentShim.ACTION_GET_CONTENT ,
                    type: "*/*"
                }, (r)=>{
                    console.log(r);  
                    window.resolveLocalFileSystemURL(r.data,(rr)=>{
                        let path = decodeURIComponent(rr.toURL()).split(":")[2];
                        console.log(path);
                        path = path.split('/');
                        path.pop();
                        path = path.join('/');
                        console.log(path);
                        path = `file:///sdcard/${path}`;
                        console.log(path);
                        loaddir(path);
                        console.log(rr.toURL())}, ()=>{
                            alert("Ошибка выбора папки.");
                        });
                }, (a)=>{
                    alert("Ошибка выбора папки.");
            });
        }
    );
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    loadratings();
}