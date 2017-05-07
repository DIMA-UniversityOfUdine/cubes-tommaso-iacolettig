function col(name, index) {
	var colors = {
        "blue": [0x3498db],
        "brown": [0x201010, 0x632f1f],
        "green": [0x1e770e, 0x144f09, 0x33b51c, 0x065409, 0x013503],
        "grey": [0xc1c1b0, 0x262121],
        "red": [0xc0392b, 0xdd1313]
    }
   
    return colors[name][index];
}