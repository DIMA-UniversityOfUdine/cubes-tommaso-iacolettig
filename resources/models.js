function drawTerrain(resolution, maxRes, waterArray) {
    var terrain_scaleContainer = new THREE.Group();

    var img = new Image();
    img.src = "textures/heightmap_" + resolution + ".png";

    img.onload = function() {
        var data = getHeightData(img, 0.3);

        var size = 0.05; // Box size
        var waterLevel = 8.5;
        var waterOpacity = 0.5;
        var scaleXZ = maxRes / resolution; // Scale factor according to the resolution
        var treeProbability = 1/20 * scaleXZ; // Higher probability with fewer cubes

        var terrain = new THREE.Group();
        var groundGroup = new THREE.Group();
        var waterGroup = new THREE.Group();
        var treesGroup = new THREE.Group();

        waterGroup.name = "waterGroup";

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
            ground.position.set(i % resolution * size, height * size / 2, Math.floor(i / resolution) * size); // Box positioning (x and z according to the resolution, y according to the height)
            ground.castShadow = true;
            ground.receiveShadow = true;
            groundGroup.add(ground);

            // Water
            var waterScale = Math.max(waterLevel - height, 0); // Water scale factor. If 0, the water is not shown

            if(waterScale > 0) {
                var water = new WaterComponent(geometry, waterMaterial, waterScale, i, resolution, height);
                waterArray.push(water);
                waterGroup.add(water.draw());
            }

            // Trees
            if(c == col("green", 0) || c == col("green", 1)) { // Only if the ground color is green
                if(Math.random() < treeProbability) {
                    var tree = drawTree();
                    tree.scale.set(size, size * scaleXZ, size); // Tree y-scaling is necessary to preserve the proportions (there will be terrain xz-scaling)
                    tree.position.set(i % resolution * size, height * size, Math.floor(i / resolution) * size);
                    treesGroup.add(tree);
                }
            }
        }

        terrain.add(groundGroup);
        terrain.add(waterGroup);
        terrain.add(treesGroup);

        terrain.position.set(-resolution * size / 2, 0, -resolution * size / 2); // Terrain centering
        terrain_scaleContainer.add(terrain);
        terrain_scaleContainer.scale.set(scaleXZ, 1, scaleXZ); // Width and height fixing for all the resolutions
    }

    return terrain_scaleContainer;
}

class WaterComponent {
    constructor(waterGeometry, waterMaterial, waterScale, index, resolution, height) {
        this.waterGeometry = waterGeometry;
        this.waterMaterial = waterMaterial;
        this.waterScale = waterScale;
        this.index = index;
        this.resolution = resolution;
        this.height = height;

        this.angle = Math.floor(this.index / this.resolution) * 8 * Math.PI / (this.resolution - 1); // Angle for the sin function
        this.delta = this.deltaFunction(this.angle); // Waves displacement value
    }

    update() {
        this.angle += 0.1;
        this.delta = this.deltaFunction(this.angle);
    }

    deltaFunction(angle) {
        return (Math.sin(angle) - 1) / 3;
    }

    draw() {
        var water = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
        water.scale.y = this.waterScale + this.delta;

        // Water positioning (x and z according to the resolution, y according to the height, the water size and delta as well)
        water.position.x = this.index % this.resolution * this.waterGeometry.parameters.width;
        water.position.y = this.height * this.waterGeometry.parameters.width + (this.waterScale + this.delta) * this.waterGeometry.parameters.width / 2;
        water.position.z = Math.floor(this.index / this.resolution) * this.waterGeometry.parameters.width;

        return water;
    }
}

function drawTree() {
    var treeModels = 3;

    // Trunk
    var trunkGeometry = new THREE.BoxGeometry(0.2, 1, 0.2); // The same for every tree
    var trunkMaterial = new THREE.MeshPhongMaterial( {color: col("brown", 1)} );
    var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.set(0, trunkGeometry.parameters.height / 2, 0);

    // Foliage
    var randomNumber = Math.floor(Math.random() * treeModels);

    switch(randomNumber) {
        case 0:
            var foliageGeometry = new THREE.BoxGeometry(1, 1, 1);
            var foliageMaterial = new THREE.MeshPhongMaterial( {color: col("green", 2)} );
            var foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            foliage.position.set(0, trunkGeometry.parameters.height + foliageGeometry.parameters.height / 2, 0);
            break;
        case 1:
            var foliageGeometry = new THREE.BoxGeometry(0.8, 2, 0.8);
            var foliageMaterial = new THREE.MeshPhongMaterial( {color: col("green", 3)} );
            var foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            foliage.position.set(0, trunkGeometry.parameters.height + foliageGeometry.parameters.height / 2, 0);
            break;
        case 2:
            var foliage = new THREE.Group();
            var foliageMaterial = new THREE.MeshPhongMaterial( {color: col("green", 4)} );

            for(var i = 0; i < 6; i++) {
                var foliageGeometry = new THREE.BoxGeometry(1 - i * 0.15, 0.25, 1 - i * 0.15);
                var foliageLevel = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliageLevel.castShadow = true;
                foliageLevel.receiveShadow = true;
                foliageLevel.position.set(0, trunkGeometry.parameters.height / 2 + i * foliageGeometry.parameters.height, 0);
                foliage.add(foliageLevel);
            }
            
            break;
    }

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
        this.size = size;

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

function drawAirplane() {
    // Body
    var bodyGeometry = new THREE.BoxGeometry(1, 1, 3);
    var bodyMaterial = new THREE.MeshPhongMaterial( {color: col("red", 1)} );
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.set(0, 0, 0);

    // Glass
    var glassGeometry = new THREE.BoxGeometry(0.8, 0.45, 1.5);
    var glassMaterial = new THREE.MeshPhongMaterial( {color: col("blue", 0), transparent: true, opacity: 0.85} );
    var glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.castShadow = true;
    glass.receiveShadow = true;
    glass.position.set(0, bodyGeometry.parameters.height / 2 + glassGeometry.parameters.height / 2, 0);

    // Top
    var topGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.2);
    var topMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff} );
    var top = new THREE.Mesh(topGeometry, topMaterial);
    top.castShadow = true;
    top.receiveShadow = true;
    top.position.set(0, 0, -bodyGeometry.parameters.depth / 2 - topGeometry.parameters.depth / 2);

    // Propeller
    var propellerGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
    var propellerMaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );
    var propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.castShadow = true;
    propeller.receiveShadow = true;
    propeller.position.set(0, 0, -bodyGeometry.parameters.depth / 2 - topGeometry.parameters.depth - propellerGeometry.parameters.depth / 2);
    propeller.name = "propeller";

    // Wings
    var wings = new THREE.Group();
    var wingGeometry = new THREE.BoxGeometry(7, 0.1, 1);
    var wingMaterial = new THREE.MeshPhongMaterial( {color: col("red", 1)} );

    var wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
    wing1.castShadow = true;
    wing1.receiveShadow = true;
    wing1.position.set(0, -bodyGeometry.parameters.height / 2, 0);
    wings.add(wing1);

    var wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
    wing2.castShadow = true;
    wing2.receiveShadow = true;
    wing2.position.set(0, 1, 0);
    wings.add(wing2);

    // Supports
    var wingsSupports = new THREE.Group();
    var wingsSupportGeometry = new THREE.BoxGeometry(0.05, 1.5, 0.05);
    var wingsSupportMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff} );

    for(var i = 0; i < 2; i++) {
        for(var j = 0; j < 4; j++) {
            var wingsSupport = new THREE.Mesh(wingsSupportGeometry, wingsSupportMaterial);
            wingsSupport.castShadow = true;
            wingsSupport.receiveShadow = true;
            wingsSupport.position.set(j * 2 - 3, 0.25, i * 0.6 - 0.3);
            wingsSupports.add(wingsSupport);
        }
    }

    // Tail
    var tail = new THREE.Group();
    var tailDepth = 0;
    var tailComponentMaterial = new THREE.MeshPhongMaterial( {color: col("red", 1)} );

    for(var i = 0; i < 10; i++) {
        var tailComonentGeometry = new THREE.BoxGeometry(1 - i * 0.07, 1 - i * 0.07, 0.2);
        var tailComponent = new THREE.Mesh(tailComonentGeometry, tailComponentMaterial);
        tailComponent.castShadow = true;
        tailComponent.receiveShadow = true;
        tailComponent.position.set(0, (1 - tailComonentGeometry.parameters.height) / 2, bodyGeometry.parameters.depth / 2 + (i + 1/2) * tailComonentGeometry.parameters.depth);
        tail.add(tailComponent);

        tailDepth += tailComonentGeometry.parameters.depth;
    }

    // Ailerons
    var ailerons = new THREE.Group();
    var aileronMaterial = new THREE.MeshPhongMaterial( {color: col("red", 1)} );

    var aileronGeometry1 = new THREE.BoxGeometry(2, 0.1, 0.4);
    var aileron1 = new THREE.Mesh(aileronGeometry1, aileronMaterial);
    aileron1.castShadow = true;
    aileron1.receiveShadow = true;
    aileron1.position.set(0, bodyGeometry.parameters.height / 2 - aileronGeometry1.parameters.height / 2, bodyGeometry.parameters.depth / 2 + tailDepth - aileronGeometry1.parameters.depth / 2);
    ailerons.add(aileron1);

    var aileronGeometry2 = new THREE.BoxGeometry(0.1, 0.5, 0.4);
    var aileron2 = new THREE.Mesh(aileronGeometry2, aileronMaterial);
    aileron2.castShadow = true;
    aileron2.receiveShadow = true;
    aileron2.position.set(0, bodyGeometry.parameters.height / 2 + aileronGeometry2.parameters.height / 2, bodyGeometry.parameters.depth / 2 + tailDepth - aileronGeometry2.parameters.depth / 2);
    ailerons.add(aileron2);

    // Wheels structure
    var wheelsStructure = new THREE.Group();

    // Supports
    var wheelsSupportGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.6);
    var wheelsSupportMaterial = new THREE.MeshPhongMaterial( {color: col("red", 1)} );

    var wheelsSupport1 = new THREE.Mesh(wheelsSupportGeometry, wheelsSupportMaterial);
    wheelsSupport1.castShadow = true;
    wheelsSupport1.receiveShadow = true;
    wheelsSupport1.position.set(0.4, -bodyGeometry.parameters.height / 2 - wheelsSupportGeometry.parameters.height / 2, 0);
    wheelsStructure.add(wheelsSupport1);

    var wheelsSupport2 = new THREE.Mesh(wheelsSupportGeometry, wheelsSupportMaterial);
    wheelsSupport2.castShadow = true;
    wheelsSupport2.receiveShadow = true;
    wheelsSupport2.position.set(-0.4, -bodyGeometry.parameters.height / 2 - wheelsSupportGeometry.parameters.height / 2, 0);
    wheelsStructure.add(wheelsSupport2);

    // Bar
    var wheelsBarGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
    var wheelsBarMaterial = new THREE.MeshPhongMaterial( {color: col("grey", 1)} );
    var wheelsBar = new THREE.Mesh(wheelsBarGeometry, wheelsBarMaterial);
    wheelsBar.castShadow = true;
    wheelsBar.receiveShadow = true;
    wheelsBar.position.set(0, -bodyGeometry.parameters.height / 2 - 4 / 5 * wheelsSupportGeometry.parameters.height, 0)
    wheelsStructure.add(wheelsBar);

    // Wheels
    var wheelGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.5);
    var wheelMaterial = new THREE.MeshPhongMaterial( {color: 0x000000} );

    var wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.castShadow = true;
    wheel1.receiveShadow = true;
    wheel1.position.set(4 / 5 * wheelsBarGeometry.parameters.width / 2, -bodyGeometry.parameters.height / 2 - 4 / 5 * wheelsSupportGeometry.parameters.height, 0)
    wheelsStructure.add(wheel1);

    var wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.castShadow = true;
    wheel2.receiveShadow = true;
    wheel2.position.set(-4 / 5 * wheelsBarGeometry.parameters.width / 2, -bodyGeometry.parameters.height / 2 - 4 / 5 * wheelsSupportGeometry.parameters.height, 0)
    wheelsStructure.add(wheel2);

    // Rims
    var rimGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.3);
    var rimMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff} );

    var rim1 = new THREE.Mesh(rimGeometry, rimMaterial);
    rim1.castShadow = true;
    rim1.receiveShadow = true;
    rim1.position.set(4 / 5 * wheelsBarGeometry.parameters.width / 2, -bodyGeometry.parameters.height / 2 - 4 / 5 * wheelsSupportGeometry.parameters.height, 0)
    wheelsStructure.add(rim1);

    var rim2 = new THREE.Mesh(rimGeometry, rimMaterial);
    rim2.castShadow = true;
    rim2.receiveShadow = true;
    rim2.position.set(-4 / 5 * wheelsBarGeometry.parameters.width / 2, -bodyGeometry.parameters.height / 2 - 4 / 5 * wheelsSupportGeometry.parameters.height, 0)
    wheelsStructure.add(rim2);

    // Airplane
    var airplane = new THREE.Group();
    airplane.add(body);
    airplane.add(glass);
    airplane.add(top);
    airplane.add(propeller);
    airplane.add(wings);
    airplane.add(wingsSupports);
    airplane.add(tail);
    airplane.add(ailerons);
    airplane.add(wheelsStructure);

    return airplane;
}

function drawText() {
    var textGroup = new THREE.Group();
    var fontLoader = new THREE.FontLoader();

    fontLoader.load('fonts/helvetiker_bold.typeface.json', function(font) {
        var myUpperText = "IACO's";
        var myLowerText = "VOLCANO";

        var textMaterial = new THREE.MeshPhongMaterial( {color: col("grey", 0)} );

        // Lower text
        var lowerTextGeometry = new THREE.TextGeometry(myLowerText, {
            font: font,
            size: 0.34,
            height: 0.3,
            curveSegments: 10
        });

        lowerTextGeometry.computeBoundingBox();
        var lowerText = new THREE.Mesh(lowerTextGeometry, textMaterial);
        lowerText.castShadow = true;
        lowerText.receiveShadow = true;
        lowerText.position.x = -(lowerTextGeometry.boundingBox.max.x - lowerTextGeometry.boundingBox.min.x) / 2;
        textGroup.add(lowerText);

        // Upper text
        var upperTextGeometry = new THREE.TextGeometry(myUpperText, {
            font: font,
            size: 0.5,
            height: 0.3,
            curveSegments: 10
        });

        upperTextGeometry.computeBoundingBox();
        var upperText = new THREE.Mesh(upperTextGeometry, textMaterial);
        upperText.castShadow = true;
        upperText.receiveShadow = true;
        upperText.position.x = -(upperTextGeometry.boundingBox.max.x - upperTextGeometry.boundingBox.min.x) / 2;
        upperText.position.y = 5 / 4 *(lowerTextGeometry.boundingBox.max.y - lowerTextGeometry.boundingBox.min.y);
        textGroup.add(upperText);
    });

    return textGroup;
}