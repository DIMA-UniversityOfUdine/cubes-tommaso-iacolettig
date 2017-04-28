function col(name, index) {
	var colors = {
        "brown": [0x201010],
        "green": [0x1e770e, 0x144f09],
        "grey": [0xc1c1b0, 0x262121]
    }
   
    return colors[name][index];
}