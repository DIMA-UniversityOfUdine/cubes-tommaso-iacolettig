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

        var terrain = new THREE.Group();

        var geometry = new THREE.BoxGeometry(size, size, size); // Same geometry for ground and water
        var waterMaterial = new THREE.MeshPhongMaterial( {color: 0x3498db, transparent: true, opacity: waterOpacity} );

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
        }

        terrain.position.set(-resolution * size / 2, 0, -resolution * size / 2); // Terrain centering
        terrain_scaleContainer.add(terrain);
        terrain_scaleContainer.scale.set(scaleXZ, 1, scaleXZ); // Width and height fixing for all the resolutions
    }

    return terrain_scaleContainer;
}