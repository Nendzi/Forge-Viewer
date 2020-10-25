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
        this._button.onClick = (ev) => {
            // this is place for code for preesed button
            const DOOR_PARTS = this.viewer.getSelection();
            console.log(DOOR_PARTS);

            if (this.doorIsOpen) {
                this.doorIsOpen = false;
                this._button.setToolTip('Close the doors');
                this._closeDoors(DOOR_PARTS);
            }
            else {
                this.doorIsOpen = true;
                this._button.setToolTip('Open the doors');
                this._openDoors(DOOR_PARTS);
            }
        };
  
        this._button.addClass('myAwesomeExtensionIcon');
        this._group.addControl(this._button);
    }

    doorIsOpen = false;

    _openDoors(ids) {
        this._animateDoors(ids, 0, 0.1);
    }

    _closeDoors(ids) {
        this._animateDoors(ids, 0, -0.1);
    }

    _animateDoors(ids, startPosition, step) {
        const viewer = this.viewer;
        const it = viewer.model.getData().instanceTree;
        console.log(it);
        const axis = new THREE.Vector3(0, 0, 1);
        console.log(axis);
        const meshes = [];

        console.log(ids);
        for (var id in ids) {
            it.enumNodeFragments(id, function (fragId) {
                const mesh = viewer.impl.getFragmentProxy(viewer.model, fragId);
                mesh.scale = new THREE.Vector3(1, 1, 1);
                mesh.quaternion = new THREE.Quaternion(0, 0, 0, 1);
                mesh.position = new THREE.Vector3(0, 0, 0);
                meshes.push(mesh);
                console.log(meshes);
            }, true);
        }

        let counter = startPosition;

        this._timer = setInterval(function () {
            for (const mesh of meshes) {
                mesh.quaternion.setFromAxisAngle(axis, Math.PI * counter);
                mesh.updateAnimTransform();
            }
            counter += step;
            console.log(Math.PI * counter);
            viewer.impl.invalidate(true, true, true);
        }, 100);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);
