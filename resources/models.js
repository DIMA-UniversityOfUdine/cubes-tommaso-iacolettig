function drawTerrain(resolution, maxRes) {
    var terrain_scaleContainer = new THREE.Group();

    var img = new Image();
    img.src = "textures/heightmap_" + resolution + ".png";

    img.onload = function() {
        var size = 0.05; // Box size
        var waterLevel = 8;
        var waterOpacity = 0.5;
        var data = getHeightData(img, 0.3);
        var scaleXZ = maxRes / resolution; // Scale factor according to the resolution
        var treeProbability = 1/20 * scaleXZ;
        var treeScale = 0.1;

        var terrain = new THREE.Group();

        var geometry = new THREE.BoxGeometry(size, size, size); // Same geometry for ground and water
        var waterMaterial = new THREE.MeshPhongMaterial( {color: col("blue", 0), transparent: true, opacity: waterOpacity} );

        for(var i = 0; i < data.length; i++) {
            var height = data[i];

            // Ground color according to the height value
            var c;
            if(height < 12) {
                c = col("grey", 0);
            } else if(height < 14) {
                c = randomValue(col("grey", 0), col("green", 0), 1/3);
            } else if(height < 30) {
                c = randomValue(col("green", 0), col("green", 1), 1/2);
            } else if(height < 36) {
                c = randomValue(col("brown", 0), col("green", 1), 1/3);
            } else {
                c = randomValue(col("grey", 1), col("brown", 0), 1/3);
            }

            // Ground
            var groundMaterial = new THREE.MeshPhongMaterial( {color: c} );
            var ground = new THREE.Mesh(geometry, groundMaterial);
            ground.scale.y = height; // Box scaling along the y axis according to the height
            ground.position.set(i % resolution * size, height * size / 2, i / resolution * size); // Box positioning (x and z according to the resolution, y according to the height)
            ground.castShadow = true;
            ground.receiveShadow = true;
            terrain.add(ground);

            // Water
            var water = new THREE.Mesh(geometry, waterMaterial);
            var waterScale = Math.max(waterLevel - height, 0); // Water scale factor. If 0, the water is not shown

            if(waterScale > 0) {
                water.scale.y = waterScale;
                water.position.set(i % resolution * size, height * size + waterScale * size / 2, i / resolution * size); // Water positioning (similar to the previous one, the only difference is in the y value where I have to consider the water size as well)
                terrain.add(water);
            }

            // Trees
            if(c == col("green", 0) || c == col("green", 1)) { // Only if the ground color is green
                if(Math.random() < treeProbability) {
                    var tree = drawTree();
                    tree.scale.set(treeScale / scaleXZ, treeScale, treeScale / scaleXZ); // Tree XZ-scaling is necessary to counteract the terrain one
                    tree.position.set(i % resolution * size, height * size, i / resolution * size);
                    terrain.add(tree);
                }
            }
        }

        terrain.position.set(-resolution * size / 2, 0, -resolution * size / 2); // Terrain centering
        terrain_scaleContainer.add(terrain);
        terrain_scaleContainer.scale.set(scaleXZ, 1, scaleXZ); // Width and height fixing for all the resolutions
    }

    return terrain_scaleContainer;
}

function drawTree() {
    // Trunk
    var trunkGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    var trunkMaterial = new THREE.MeshPhongMaterial( {color: col("brown", 1)} );
    var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.set(0, trunkGeometry.parameters.height / 2, 0);

    // Foliage
    var foliageGeometry = new THREE.BoxGeometry(1, 1, 1);
    var foliageMaterial = new THREE.MeshPhongMaterial( {color: col("green", 2)} );
    var foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    foliage.position.set(0, trunkGeometry.parameters.height + foliageGeometry.parameters.height / 2, 0);

    // Tree
    var tree = new THREE.Group();
    tree.add(trunk);
    tree.add(foliage);

    return tree;
}

class SmokeParticle {
    constructor(x, y, z, size) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size + Math.sin(Math.random() * 2 * Math.PI) * 0.05;

        this.opacity = 0.8;
        this.opacityDiff = (Math.floor(Math.random() * 6) + 5) / 1500;
    }

    update() {
        this.y += 0.01;
        this.size += 0.002;

        if(this.check()) {
            this.opacity -= this.opacityDiff;
        } else {
            this.opacity = 0;
        }
    }

    check() {
        return this.opacity > 0;
    }

    draw() {
        var smokeGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        var smokeMaterial = new THREE.MeshPhongMaterial( {color: col("grey", 0), transparent: true, opacity: this.opacity} );
        var smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
        smoke.castShadow = true;
        smoke.position.set(this.x, this.y, this.z);

        return smoke;
    }
}