// variáveis globais que representam respectivamente o canvas, o objeto contexto 2D do canvas, a largura e altura da imagem setadas no css, a matriz de pixels da imagem original e a matriz de pixels da imagem que está atualmente no canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var imageWidth;
var imageHeight;
var originalImageMatrix;
var imageCanvas;


// função para mostrar a imagem selecionada do computador inicialmente sem filtros
function showImage(input){
	var image = document.getElementById("myImage");

	if (input.files && input.files[0]){
		var reader = new FileReader();
		reader.onload = function(e){
			image.src = e.target.result;
		};
		reader.onloadend = function(e){
			showImageOnCanvas(image);
		}

		reader.readAsDataURL(input.files[0]);
	}
}

// função para mostrar a imagem dentro do canvas
function showImageOnCanvas(image){

	// pega o estilo da imagem para resgatar o valor da altura e largura
	var imageStyle = getComputedStyle(image);
	imageWidth = imageStyle.width.slice(0, -2);
	imageHeight = imageStyle.height.slice(0, -2);

	// coloca a largura e altura do canvas para ser a mesma da imagem e depois desenha
	c.width = imageWidth;
	c.height = imageHeight;
	ctx.drawImage(image, 0, 0, imageWidth, imageHeight);

	// extraindo os dados dos pixels que estão dentro do canvas
	var imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

	// transformando os dados extraídos do canvas e colocando numa variável global que representa a matriz da imagem original
	originalImageMatrix = imageToMatrix(imageData, imageWidth, imageHeight);
	imageCanvas = imageToMatrix(imageData, imageWidth, imageHeight);

}



// função que transforma o formato de dados original da imagem em uma matriz(array de arrays) de pixels
function imageToMatrix(imageData, imageWidth, imageHeight){
	var pixelArray = [];
	var i;


	// organiza os pixels em um array de maneira que cada elemento é um pixel ao invés de um atributo RGBA
	for (i = 0; i < imageData.data.length; i += 4){
		var pixel = new Pixel(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]);
		pixelArray.push(pixel);
	}

	// organiza a imagem em um array de arrays, ou seja, uma matriz de pixels
	var imageMatrix = [];
	i = 0;

	for (var linha = 0; linha < imageHeight; linha++){
		var lineTemp = [];

		for (var coluna = 0; coluna < imageWidth; coluna++){
			lineTemp.push(pixelArray[i]);
			i++;
		}

		imageMatrix.push(lineTemp);
	}

	return imageMatrix;
}


// função que transforma a matriz de pixels de volta no formato de dados da imagem
function matrixToImage(imageMatrix, imageWidth, imageHeight){
	var imageData = ctx.createImageData(imageWidth, imageHeight);
	var i = 0;

	// faz uma iteração na matriz e organiza tudo como forma de dados da imagem da maneira que é originalmente
	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			imageData.data[i] = pixel.r;
			imageData.data[i + 1] = pixel.g;
			imageData.data[i + 2] = pixel.b;
			imageData.data[i + 3] = pixel.a;
			i += 4;
		}
	}

	return imageData;

}


function numberToBinary(number){

	binary = number.toString(2);
	if (binary.length < 8){
		while (binary.length != 8){
			binary = '0' + binary;
		}
	}

	return binary;
}

function binaryToNumber(binary){

	number = parseInt(binary, 2).toString(10);

	return number;

}

function sliceBit(value, bit){

	
	var arrayBit = numberToBinary(value).split('');

	//var bitPosition = bit - arrayBit.length;

	bitValue = arrayBit[8 - bit];

	if (bitValue == 0){
		return 0;
	} else {
		var arrayAux = ['0', '0', '0', '0', '0', '0', '0', '0'];

		//for (var i = 0; i < arrayBit.length; i++){
		//	arrayAux.push('0');
		//}
		
		arrayAux[8 - bit] = '1';

		var binaryValue = arrayAux.join('');
		return binaryToNumber(binaryValue);
	}

}

function eqReta(inicio, fim, value){
	var m = (fim[1] - inicio[1]) / (fim[0] - inicio[0]);

	var y = m * (value - inicio[0]) + fim[0];

	return y;
}


// função que aplica o filtro negativo na imagem do canvas
function negativeFilter(){



	// itera a imagem em forma de matriz(array de arrays) de pixels e aplica o filtro negativo para cada pixel e seta a transparência para 255(sem transparência)
	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			pixel.r = 255 - pixel.r;
			pixel.g = 255 - pixel.g;
			pixel.b = 255 - pixel.b;
			pixel.a = 255;
		}
	}

	// faz a transformação que transforma a matriz de pixels de volta no formato de dados que era antes e depois coloca a imagem no canvas
	var negativeImage = matrixToImage(imageCanvas, imageWidth, imageHeight);
	ctx.putImageData(negativeImage, 0, 0);
}

function logFilter(){

	var c = document.getElementById("constante").value;

	// copia a matriz para não modificar a original
	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));


	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			pixel.r = c * Math.log(pixel.r + 1);
			pixel.g = c * Math.log(pixel.g + 1);
			pixel.b = c * Math.log(pixel.b + 1);
			pixel.a = 255;
		}
	}


	var logImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(logImage, 0, 0);
}

function powFilter(){

	var c = document.getElementById("constante").value;	

	// copia a matriz para não modificar a original
	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));


	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			pixel.r = c * Math.pow(pixel.r, 0.4);
			pixel.g = c * Math.pow(pixel.g, 0.4);
			pixel.b = c * Math.pow(pixel.b, 0.4);
			pixel.a = 255;
		}
	}

	var powImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(powImage, 0, 0);
}

function linear(inicio1, fim1, inicio2, fim2){

	var ponto1 = [inicio1, fim1];
	var ponto2 = [inicio2, fim2];
	const inicial = [0, 0];
	const final = [255, 255];


	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			if (pixel.r <= inicio1){
				pixel.r = eqReta(inicial, ponto1, pixel.r);
			} else if (pixel.r > inicio1 && pixel.r <= inicio2){
				pixel.r = eqReta(ponto1, ponto2, pixel.r);
			} else if (pixel.r > inicio2 && pixel.r <= 255){
				pixel.r = eqReta(ponto2, final, pixel.r);
			}

			if (pixel.g <= inicio1){
				pixel.g = eqReta(inicial, ponto1, pixel.g);
			} else if (pixel.g > inicio1 && pixel.g <= inicio2){
				pixel.g = eqReta(ponto1, ponto2, pixel.g);
			} else if (pixel.g > inicio2 && pixel.g <= 255){
				pixel.g = eqReta(ponto2, final, pixel.g);
			}

			if (pixel.b <= inicio1){
				pixel.b = eqReta(inicial, ponto1, pixel.b);
			} else if (pixel.b > inicio1 && pixel.b <= inicio2){
				pixel.b = eqReta(ponto1, ponto2, pixel.b);
			} else if (pixel.b > inicio2 && pixel.b <= 255){
				pixel.b = eqReta(ponto2, final, pixel.b);
			}


			pixel.a = 255;

		}
	}

	var linearImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(linearImage, 0, 0);


}




function sliceByValue(){

	var value = document.getElementById("value").value;

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			if (pixel.r < value){
				pixel.r = 0;
			}
			if (pixel.g < value){
				pixel.g = 0;
			}
			if (pixel.b < value){
				pixel.b = 0;
			}
			pixel.a = 255;

		}
	}

	var valueImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(valueImage, 0, 0);


}



function sliceByBit(){

	var bit = document.getElementById("bit").value;

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));


	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			pixel.r = sliceBit(pixel.r, bit);
			pixel.g = sliceBit(pixel.g, bit);
			pixel.b = sliceBit(pixel.b, bit);
			pixel.a = 255;

		}
	}

	var bitImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(bitImage, 0, 0);

}




/*
		var arrayAux = [];

		for (var i = 0; i < arrayBit.length; i++){
			arrayAux.push('0');
		}
		
		arrayAux[bitValue] = '1';

		var binaryValue = arrayAux.join('');
		return binaryToNumber(binaryValue);
*/