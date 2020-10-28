class MyAwesomeExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
    }

    load() {
        console.log('MyAwesomeExtensions has been loaded');
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('MyAwesomeExtensions has been unloaded');
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('myAwesomeExtensionButton');
        this._button.setToolTip('Open the doors');
        this._button.onClick = (ev) => {
            // this is place for code for preesed button
            //const DOOR_PARTS = this.viewer.getSelection();
            const DOOR_PARTS = [23, 25, 27, 29, 31, 33, 35];
            console.log(DOOR_PARTS);

            if (this.doorIsOpen) {
                this.doorIsOpen = false;
                this._button.setToolTip('Open the doors');
                this.doorChangesState = true;
                this._closeDoors(DOOR_PARTS);
            }
            else {
                this.doorIsOpen = true;
                this._button.setToolTip('Close the doors');
                this.doorChangesState = true;
                this._openDoors(DOOR_PARTS);
            }
        };

        this._button.addClass('myAwesomeExtensionIcon');
        this._group.addControl(this._button);
    }

    doorIsOpen = false;
    doorChangesState = false;

    _openDoors(ids) {
        this._animateDoors(ids, 0, -0.1);
    }

    _closeDoors(ids) {
        this._animateDoors(ids, -0.5, 0.1);
    }

    _disableAnimations() {
        clearInterval(this._timer);
    }

    _animateDoors(ids, startPosition, step) {
        const viewer = this.viewer;
        const it = viewer.model.getData().instanceTree;
        //console.log(it);
        const axis = new THREE.Vector3(0, 1, 0);
        //console.log(axis);
        const meshes = [];

        //console.log(ids);
        for (var id of ids) {
            it.enumNodeFragments(id, function (fragId) {
                const mesh = viewer.impl.getFragmentProxy(viewer.model, fragId);
                //console.log(mesh);
                mesh.scale = new THREE.Vector3(1, 1, 1);
                mesh.quaternion = new THREE.Quaternion(0, 0, 0, 1);
                mesh.position = new THREE.Vector3(0, 0, 0);
                meshes.push(mesh);
            }, true);
        }

        let counter = startPosition;

        var _timer = setInterval(function () {
            for (const mesh of meshes) {

                const posMtrx = new THREE.Matrix4().setPosition(new THREE.Vector3(-299, -277, 0));
                //console.log(posMtrx);
                const someMtrx = new THREE.Matrix4().setPosition(new THREE.Vector3(299, 277, 0));
                const mainMtrx = new THREE.Matrix4();
                //console.log(mainMtrx);

                posMtrx.multiply(mainMtrx.makeRotationZ(Math.PI * counter)).multiply(someMtrx);

                //console.log(posMtrx);
                //mesh.quaternion.setFromAxisAngle(axis, Math.PI * counter);
                posMtrx.decompose(mesh.position, mesh.quaternion, mesh.scale);
                //mesh.quaternion.setFromRotationMatrix(posMtrx);
                mesh.updateAnimTransform();
            }
            counter += step;
            console.log(counter);
            viewer.impl.invalidate(true, true, true);
            if (counter < -0.5) {
                this.doorIsOpen = true;
                this.doorChangesState = false;
                clearInterval(_timer);
                //this._disableAnimations();
            }
            if (counter > 0) {
                this.doorIsOpen = false;
                this.doorChangesState = false;
                clearInterval(_timer);
                //this._disableAnimations();
            }
        }, 100);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);