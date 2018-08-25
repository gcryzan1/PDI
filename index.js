var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var imgWidth;
var imgHeight;



function iniciar(){
	var img = document.getElementById("myImage");
	ctx.drawImage(img, 0, 0, 150, 200);
	var imgData = ctx.getImageData(0, 0 ,150 ,200);
	//console.log(imgData);
	for (var i = 0;i < imgData.data.length; i+=4){
  		imgData.data[i] = 255-imgData.data[i];
  		imgData.data[i+1] = 255-imgData.data[i+1];
  		imgData.data[i+2] = 255-imgData.data[i+2];
  		imgData.data[i+3] = 255;
  	}
  	ctx.putImageData(imgData, 0, 0);
}



function imageToMatrix(imgData, imgWidth, imgHeight){
	var pixelArray = [];
	var i;


	// organiza os pixels em um array de maneira que cada elemento é um pixel ao invés de um atributo RGBA
	for (i = 0; imgData.data.length; i+=4){
		var pixel = new Pixel(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]);
		pixelArray.push(pixel);
	}

	// organiza a imagem em um array de arrays, ou seja, uma matriz de pixels
	imgMatrix = [];
	i = 0;

	for (var linha = 0; linha < imgHeight; linha++){
		var lineTemp = [];

		for (var coluna = 0; coluna < imgWidth; coluna++){
			lineTemp.push(pixelArray[i]);
			i++;
		}

		imgMatrix.push(lineTemp);
	}

	return imgMatrix;
}



function matrixToImage(imgMatrix, imgWidth, imgHeight){

}




//ctx.moveTo(0, 0);
//ctx.lineTo(150, 200);
//ctx.stroke();