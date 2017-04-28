function getHeightData(img, scale) {
	if(scale == undefined) {
		scale = 1;
	}

    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');

    var size = img.width * img.height;
    var data = new Float32Array(size);

    context.drawImage(img, 0, 0);

    for(var i = 0; i < size; i++) {
    	data[i] = 0;
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    var j = 0;
    for(var i = 0; i < pix.length; i += 4) {
        var all = pix[i] + pix[i+1] + pix[i+2];
        data[j++] = scale * all / 3;   
    }
   
    return data;
}

// Random number between v1 and v2 according to p (probability of v1)
function randomValue(v1, v2, p) {
    var v;

    if(Math.random() < p) {
        v = v1;
    } else {
        v = v2;
    }

    return v;
}