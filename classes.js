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

function Complex(re, im) {
	this.re = re;
	this.im = im || 0.0;
}
Complex.prototype.add = function(other, dst){
	dst.re = this.re + other.re;
	dst.im = this.im + other.im;
	return dst;
}
Complex.prototype.sub = function(other, dst){
	dst.re = this.re - other.re;
	dst.im = this.im - other.im;
	return dst;
}
Complex.prototype.mul = function(other, dst){
	var r = this.re * other.re - this.im * other.im;
	dst.im = this.re * other.im + this.im * other.re;
	dst.re = r;
	return dst;
}
Complex.prototype.cexp = function(dst){
	var er = Math.exp(this.re);
	dst.re = er * Math.cos(this.im);
	dst.im = er * Math.sin(this.im);
	return dst;
}
Complex.prototype.log = function(){
	
	if( !this.re )
		console.log(this.im.toString()+'j');
	else if( this.im < 0 )
		console.log(this.re.toString()+this.im.toString()+'j');
	else
		console.log(this.re.toString()+'+'+this.im.toString()+'j');
}