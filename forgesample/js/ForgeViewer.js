var viewer;
var sceneBuilder = null;
var modelBuilder = null;

function launchViewer(urn) {
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken
    };

    Autodesk.Viewing.Initializer(options, () => {
        viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'),
            { extensions: ['Autodesk.DocumentBrowser', 'MyAwesomeExtension'] }); //,'HandleSelectionExtension','ModelSummaryExtension'
        viewer.setTheme('light-theme');        
        viewer.start();
        viewer.setLightPreset(18);
        var documentId = 'urn:' + urn;

        // ovo sam ubacio iz drugog primera
        viewer.loadExtension("Autodesk.Viewing.SceneBuilder").then(() => {
            sceneBuilder = viewer.getExtension("Autodesk.Viewing.SceneBuilder");

            sceneBuilder.addNewModel({})
                .then((modelBuilder) => {
                    let geom = new THREE.BufferGeometry().fromGeometry(
                        new THREE.BoxGeometry(60, 40, 1));
                    let phongMaterial = new THREE.MeshPhongMaterial({
                        color: new THREE.Color(1, 0, 0)
                    });
                    mesh = new THREE.Mesh(geom, phongMaterial);
                    modelBuilder.addMesh(mesh);

                    const axis = new THREE.Vector3(0, 1, 0);
                    const posVec = new THREE.Vector3(0, 0, -100);
                    const someVec = new THREE.Vector3(1, 1, 1);
                    const fixedQuat = new THREE.Quaternion(0, 0, 0, 1);

                    let counter = 0;

                    this._timer = setInterval(function () {
                        mesh.matrix = new THREE.Matrix4().compose(
                            posVec,
                            fixedQuat.setFromAxisAngle(axis, counter),
                            someVec);

                        counter += 0.01;
                        if (counter > 6.28) {
                            counter = 0;
                        }
                        modelBuilder.updateMesh(mesh);
                    }, 100);
                    
                });
        });
        // ovde se završava

        //Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function onDocumentLoadSuccess(doc) {

    var geometryItems = doc.getRoot().search({ "role": "3d", "type": "geometry" });

    // Try 3D first
    if (geometryItems.length < 1) {
        geometryItems.push(doc.getRoot().getDefaultGeometry())
    }

    viewer.loadDocumentNode(doc, geometryItems[0]).then(i => {
        // documented loaded, any action?
    });
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
        res.json().then(data => {
            callback(data.access_token, data.expires_in);
        });
    });
}