function Pixel (r,g,b,a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

function Quadrant(imageWidthBegin, imageWidthEnd, imageHeightBegin, imageHeightEnd) {
	this.imageWidthBegin = imageWidthBegin; 
	this.imageWidthEnd = imageWidthEnd;
	this.imageHeightBegin = imageHeightBegin; 
	this.imageHeightEnd = imageHeightEnd;
}


function HuffmanNode(prob) {
    this.prob = prob;
    this.id = 0;
    this.code = "";
    this.intensity = "";
}