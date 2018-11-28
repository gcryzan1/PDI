// variáveis globais que representam respectivamente o canvas, o objeto contexto 2D do canvas, a largura e altura da imagem setadas no css, a matriz de pixels da imagem original e a matriz de pixels da imagem que está atualmente no canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var imageWidth;
var imageHeight;
var imageWidth2;
var imageHeight2;
var originalImageMatrix;
var originalImageMatrix2;
var imageCanvas;
var haarHeight = 512;
var haarWidth = 512;

//var c2 = document.getElementById("myCanvas2");
//var ctx2 = c2.getContext("2d");

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

function showImage2(input){
	var image = document.getElementById("myImage2");

	if (input.files && input.files[0]){
		var reader = new FileReader();
		reader.onload = function(e){
			image.src = e.target.result;
		};
		reader.onloadend = function(e){
			showImageOnCanvas2(image);
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
	
	imageCanvas = imageToMatrix(imageData, imageWidth, imageHeight);
	originalImageMatrix = imageToMatrix(imageData, imageWidth, imageHeight);
	
	// criada uma variável x que servirá para mostrar o histograma da imagem carregada
	var x = [];

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function showImageOnCanvas2(image){

	// pega o estilo da imagem para resgatar o valor da altura e largura
	var imageStyle = getComputedStyle(image);
	imageWidth2 = imageStyle.width.slice(0, -2);
	imageHeight2 = imageStyle.height.slice(0, -2);

	// coloca a largura e altura do canvas para ser a mesma da imagem e depois desenha
	c.width = imageWidth2;
	c.height = imageHeight2;
	ctx.drawImage(image, 0, 0, imageWidth2, imageHeight2);

	// extraindo os dados dos pixels que estão dentro do canvas
	var imageData = ctx.getImageData(0, 0, imageWidth2, imageHeight2);

	// transformando os dados extraídos do canvas e colocando numa variável global que representa a matriz da imagem original
	originalImageMatrix2 = imageToMatrix(imageData, imageWidth2, imageHeight2);
	//imageCanvas = imageToMatrix(imageData, imageWidth, imageHeight);

	// criada uma variável x que servirá para mostrar o histograma da imagem carregada
	/*
	var x = [];

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
	*/
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

	bitValue = arrayBit[8 - bit];

	if (bitValue == 0){
		return 0;
	} else {
		var arrayAux = ['0', '0', '0', '0', '0', '0', '0', '0'];
		
		arrayAux[8 - bit] = '1';

		var binaryValue = arrayAux.join('');
		return binaryToNumber(binaryValue);
	}
}

function eqReta(inicio, fim, value){
	var m = (fim[1] - inicio[1]) / (fim[0] - inicio[0]);

	var y = m * (value - inicio[0]) + fim[0];

	if (y > 255){
		y = 255;
	}

	return y;
}

function countArray(array){
	var a = new Array(256);
	a.fill(0);


	for (var i = 0; i < array.length; i++){
		a[array[i]]++;
	}

	return a;
}

// função que aplica o filtro negativo na imagem do canvas
function negativeFilter(){

	var x = [];


	// itera a imagem em forma de matriz(array de arrays) de pixels e aplica o filtro negativo para cada pixel e seta a transparência para 255(sem transparência)
	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			pixel.r = 255 - pixel.r;
			pixel.g = 255 - pixel.g;
			pixel.b = 255 - pixel.b;
			pixel.a = 255;

			x.push(pixel.r);
		}
	}

	// faz a transformação que transforma a matriz de pixels de volta no formato de dados que era antes e depois coloca a imagem no canvas
	var negativeImage = matrixToImage(imageCanvas, imageWidth, imageHeight);
	ctx.putImageData(negativeImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function logFilter(){

	var x = [];

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

			var aux = parseInt(pixel.r.toFixed(), 10);
			x.push(aux);
		}
	}


	var logImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(logImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function powFilter(){

	var x = [];

	var c = document.getElementById("constante").value;	
	var gamma = document.getElementById("gamma").value;

	// copia a matriz para não modificar a original
	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));


	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			pixel.r = c * Math.pow(pixel.r, gamma);
			pixel.g = c * Math.pow(pixel.g, gamma);
			pixel.b = c * Math.pow(pixel.b, gamma);
			pixel.a = 255;

			if (pixel.r > 255){
				x.push(255);
			} else {
				var aux = parseInt(pixel.r.toFixed());
				x.push(aux);
			}
		}
	}

	var powImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(powImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function linear(){

	var x = [];

	var inicio1 = parseInt(document.getElementById("inicio1").value, 10);
	var fim1 = parseInt(document.getElementById("fim1").value, 10);
	var inicio2 = parseInt(document.getElementById("inicio2").value, 10);
	var fim2 = parseInt(document.getElementById("fim2").value, 10);
	

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

			var aux = parseInt(pixel.r.toFixed());
			x.push(aux);

		}
	}

	var linearImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(linearImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function sliceByValue(){

	var x = [];

	var value = document.getElementById("value").value;

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			if (pixel.r < value){
				pixel.r = 0;
			} else {
				pixel.r = 255;
			}
			if (pixel.g < value){
				pixel.g = 0;
			} else {
				pixel.g = 255;
			}
			if (pixel.b < value){
				pixel.b = 0;
			} else {
				pixel.b = 255;
			}
			pixel.a = 255;

			x.push(pixel.r);

		}
	}

	var valueImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(valueImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function sliceByBit(){

	var x = [];

	var bit = document.getElementById("bit").value;

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));


	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			pixel.r = sliceBit(pixel.r, bit);
			pixel.g = sliceBit(pixel.g, bit);
			pixel.b = sliceBit(pixel.b, bit);
			pixel.a = 255;

			x.push(pixel.r);

		}
	}

	var bitImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(bitImage, 0, 0);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function equalizedHistogram(){

	var red = [];
	var equalizedRed = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			red.push(pixel.r);
		}
	}

	var colorCount = countArray(red);
	var sk = (255/(imageHeight*imageWidth));


	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];
			var sum = 0;

			for (var j = 0; j <= pixel.r; j++){
				sum += colorCount[j];
			}

			pixel.r = Math.round(sk * sum);
			pixel.g = Math.round(sk * sum);
			pixel.b = Math.round(sk * sum);
			pixel.a = 255;
			equalizedRed.push(pixel.r);
		}
	}

	var trace = {
		x: equalizedRed,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var equalizedImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(equalizedImage, 0, 0);
}

function convolution(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var valor1 = parseInt(document.getElementById("valor1").value);
	var valor2 = parseInt(document.getElementById("valor2").value);
	var valor3 = parseInt(document.getElementById("valor3").value);
	var valor4 = parseInt(document.getElementById("valor4").value);
	var valor5 = parseInt(document.getElementById("valor5").value);
	var valor6 = parseInt(document.getElementById("valor6").value);
	var valor7 = parseInt(document.getElementById("valor7").value);
	var valor8 = parseInt(document.getElementById("valor8").value);
	var valor9 = parseInt(document.getElementById("valor9").value);
	var valor10 = parseInt(document.getElementById("valor10").value);
	var valor11 = parseInt(document.getElementById("valor11").value);
	var valor12 = parseInt(document.getElementById("valor12").value);
	var valor13 = parseInt(document.getElementById("valor13").value);
	var valor14 = parseInt(document.getElementById("valor14").value);
	var valor15 = parseInt(document.getElementById("valor15").value);
	var valor16 = parseInt(document.getElementById("valor16").value);
	var valor17 = parseInt(document.getElementById("valor17").value);
	var valor18 = parseInt(document.getElementById("valor18").value);
	var valor19 = parseInt(document.getElementById("valor19").value);
	var valor20 = parseInt(document.getElementById("valor20").value);
	var valor21 = parseInt(document.getElementById("valor21").value);
	var valor22 = parseInt(document.getElementById("valor22").value);
	var valor23 = parseInt(document.getElementById("valor23").value);
	var valor24 = parseInt(document.getElementById("valor24").value);
	var valor25 = parseInt(document.getElementById("valor25").value);

	var array1 = [valor1, valor2, valor3, valor4, valor5];
	var array2 = [valor6, valor7, valor8, valor9, valor10];
	var array3 = [valor11, valor12, valor13, valor14, valor15];
	var array4 = [valor16, valor17, valor18, valor19, valor20];
	var array5 = [valor21, valor22, valor23, valor24, valor25];

	var convolutionMatrix = [];
	convolutionMatrix.push(array1);
	convolutionMatrix.push(array2);
	convolutionMatrix.push(array3);
	convolutionMatrix.push(array4);
	convolutionMatrix.push(array5);

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var sumR = 0;
			var sumG = 0;
			var sumB = 0;

			for (var linhaC = 0; linhaC < 5; linhaC++){
				for (var colunaC = 0; colunaC < 5; colunaC++){
					var indexLinha = linha - 2 + linhaC;
					var indexColuna = coluna - 2 + colunaC;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						sumR += convolutionMatrix[linhaC][colunaC] * pixel.r;
						sumG += convolutionMatrix[linhaC][colunaC] * pixel.g;
						sumB += convolutionMatrix[linhaC][colunaC] * pixel.b;
					}
				}
			}

			var pixel = imageMatrix[linha][coluna];

			pixel.r = sumR;
			pixel.g = sumG;
			pixel.b = sumB;

			if (pixel.r < 0){
				pixel.r = 0;
			} else if (pixel.r > 255){
				pixel.r = 255;
			}
			if (pixel.g < 0){
				pixel.g = 0;
			} else if (pixel.g > 255){
				pixel.g = 255;
			}
			if (pixel.b < 0){
				pixel.b = 0;
			} else if (pixel.b > 255){
				pixel.b = 255;
			}



			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var convolutedImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(convolutedImage, 0, 0);
}

function convolutionAverage(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var valor1 = parseInt(document.getElementById("valor1").value);
	var valor2 = parseInt(document.getElementById("valor2").value);
	var valor3 = parseInt(document.getElementById("valor3").value);
	var valor4 = parseInt(document.getElementById("valor4").value);
	var valor5 = parseInt(document.getElementById("valor5").value);
	var valor6 = parseInt(document.getElementById("valor6").value);
	var valor7 = parseInt(document.getElementById("valor7").value);
	var valor8 = parseInt(document.getElementById("valor8").value);
	var valor9 = parseInt(document.getElementById("valor9").value);
	var valor10 = parseInt(document.getElementById("valor10").value);
	var valor11 = parseInt(document.getElementById("valor11").value);
	var valor12 = parseInt(document.getElementById("valor12").value);
	var valor13 = parseInt(document.getElementById("valor13").value);
	var valor14 = parseInt(document.getElementById("valor14").value);
	var valor15 = parseInt(document.getElementById("valor15").value);
	var valor16 = parseInt(document.getElementById("valor16").value);
	var valor17 = parseInt(document.getElementById("valor17").value);
	var valor18 = parseInt(document.getElementById("valor18").value);
	var valor19 = parseInt(document.getElementById("valor19").value);
	var valor20 = parseInt(document.getElementById("valor20").value);
	var valor21 = parseInt(document.getElementById("valor21").value);
	var valor22 = parseInt(document.getElementById("valor22").value);
	var valor23 = parseInt(document.getElementById("valor23").value);
	var valor24 = parseInt(document.getElementById("valor24").value);
	var valor25 = parseInt(document.getElementById("valor25").value);

	var array1 = [valor1, valor2, valor3, valor4, valor5];
	var array2 = [valor6, valor7, valor8, valor9, valor10];
	var array3 = [valor11, valor12, valor13, valor14, valor15];
	var array4 = [valor16, valor17, valor18, valor19, valor20];
	var array5 = [valor21, valor22, valor23, valor24, valor25];

	var convolutionMatrix = [];
	convolutionMatrix.push(array1);
	convolutionMatrix.push(array2);
	convolutionMatrix.push(array3);
	convolutionMatrix.push(array4);
	convolutionMatrix.push(array5);


	var div = 1;

	if (convolutionMatrix[0][0] == 0 && convolutionMatrix[0][1] == 0 && convolutionMatrix[0][2] == 0 && convolutionMatrix[0][3] == 0 && convolutionMatrix[0][4] == 0 
		&& convolutionMatrix[1][0] == 0 && convolutionMatrix[1][4] == 0 && convolutionMatrix[2][0] == 0 && convolutionMatrix[2][4] == 0 && convolutionMatrix[3][0] == 0 
		&& convolutionMatrix[3][4] == 0 && convolutionMatrix[4][0] == 0 && convolutionMatrix[4][1] == 0 && convolutionMatrix[4][2] == 0 && convolutionMatrix[4][3] == 0 && convolutionMatrix[4][4] == 0){
		div = 9;
	} else {
		div = 25;
	}

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var sumR = 0;
			var sumG = 0;
			var sumB = 0;

			for (var linhaC = 0; linhaC < 5; linhaC++){
				for (var colunaC = 0; colunaC < 5; colunaC++){
					var indexLinha = linha - 2 + linhaC;
					var indexColuna = coluna - 2 + colunaC;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						sumR += convolutionMatrix[linhaC][colunaC] * pixel.r;
						sumG += convolutionMatrix[linhaC][colunaC] * pixel.g;
						sumB += convolutionMatrix[linhaC][colunaC] * pixel.b;
					}
				}
			}

			var pixel = imageMatrix[linha][coluna];

			pixel.r = sumR / div;
			pixel.g = sumG / div;
			pixel.b = sumB / div;

			if (pixel.r < 0){
				pixel.r = 0;
			} else if (pixel.r > 255){
				pixel.r = 255;
			}
			if (pixel.g < 0){
				pixel.g = 0;
			} else if (pixel.g > 255){
				pixel.g = 255;
			}
			if (pixel.b < 0){
				pixel.b = 0;
			} else if (pixel.b > 255){
				pixel.b = 255;
			}



			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var convolutedImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(convolutedImage, 0, 0);
}

function convolutionWeighted(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var valor1 = parseInt(document.getElementById("valor1").value);
	var valor2 = parseInt(document.getElementById("valor2").value);
	var valor3 = parseInt(document.getElementById("valor3").value);
	var valor4 = parseInt(document.getElementById("valor4").value);
	var valor5 = parseInt(document.getElementById("valor5").value);
	var valor6 = parseInt(document.getElementById("valor6").value);
	var valor7 = parseInt(document.getElementById("valor7").value);
	var valor8 = parseInt(document.getElementById("valor8").value);
	var valor9 = parseInt(document.getElementById("valor9").value);
	var valor10 = parseInt(document.getElementById("valor10").value);
	var valor11 = parseInt(document.getElementById("valor11").value);
	var valor12 = parseInt(document.getElementById("valor12").value);
	var valor13 = parseInt(document.getElementById("valor13").value);
	var valor14 = parseInt(document.getElementById("valor14").value);
	var valor15 = parseInt(document.getElementById("valor15").value);
	var valor16 = parseInt(document.getElementById("valor16").value);
	var valor17 = parseInt(document.getElementById("valor17").value);
	var valor18 = parseInt(document.getElementById("valor18").value);
	var valor19 = parseInt(document.getElementById("valor19").value);
	var valor20 = parseInt(document.getElementById("valor20").value);
	var valor21 = parseInt(document.getElementById("valor21").value);
	var valor22 = parseInt(document.getElementById("valor22").value);
	var valor23 = parseInt(document.getElementById("valor23").value);
	var valor24 = parseInt(document.getElementById("valor24").value);
	var valor25 = parseInt(document.getElementById("valor25").value);

	var array1 = [valor1, valor2, valor3, valor4, valor5];
	var array2 = [valor6, valor7, valor8, valor9, valor10];
	var array3 = [valor11, valor12, valor13, valor14, valor15];
	var array4 = [valor16, valor17, valor18, valor19, valor20];
	var array5 = [valor21, valor22, valor23, valor24, valor25];

	var convolutionMatrix = [];
	convolutionMatrix.push(array1);
	convolutionMatrix.push(array2);
	convolutionMatrix.push(array3);
	convolutionMatrix.push(array4);
	convolutionMatrix.push(array5);



	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var sumR = 0;
			var sumG = 0;
			var sumB = 0;

			var sum = 0;

			for (var linhaC = 0; linhaC < 5; linhaC++){
				for (var colunaC = 0; colunaC < 5; colunaC++){
					var indexLinha = linha - 2 + linhaC;
					var indexColuna = coluna - 2 + colunaC;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						sumR += convolutionMatrix[linhaC][colunaC] * pixel.r;
						sumG += convolutionMatrix[linhaC][colunaC] * pixel.g;
						sumB += convolutionMatrix[linhaC][colunaC] * pixel.b;

					}
					sum += convolutionMatrix[linhaC][colunaC];
				}
			}

			var pixel = imageMatrix[linha][coluna];

			if (sum == 0){
				sum = 1;
			}

			pixel.r = sumR / sum;
			pixel.g = sumG / sum;
			pixel.b = sumB / sum;

			if (pixel.r < 0){
				pixel.r = 0;
			} else if (pixel.r > 255){
				pixel.r = 255;
			}
			if (pixel.g < 0){
				pixel.g = 0;
			} else if (pixel.g > 255){
				pixel.g = 255;
			}
			if (pixel.b < 0){
				pixel.b = 0;
			} else if (pixel.b > 255){
				pixel.b = 255;
			}



			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var convolutedImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(convolutedImage, 0, 0);
}

function mediana(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var listaMedianaR = [];
			var listaMedianaG = [];
			var listaMedianaB = [];

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						listaMedianaR.push(pixel.r);
						listaMedianaG.push(pixel.g);
						listaMedianaB.push(pixel.b);

					}
				}
			}

			listaMedianaR.sort(function(a, b){return a - b});
			listaMedianaG.sort(function(a, b){return a - b});
			listaMedianaB.sort(function(a, b){return a - b});

			var mid = (listaMedianaR.length + 1) / 2;
			var pixel = imageMatrix[linha][coluna];
			pixel.r = listaMedianaR[mid];
			pixel.g = listaMedianaG[mid];
			pixel.b = listaMedianaB[mid];

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var medianaImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(medianaImage, 0, 0);
}

function geometricMean(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var multR = 1;
			var multG = 1;
			var multB = 1;

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						multR *= pixel.r;
						multG *= pixel.g;
						multB *= pixel.b;

					}
				}
			}

			var pixel = imageMatrix[linha][coluna];
			pixel.r = Math.pow(multR, 1/(size*size));
			pixel.g = Math.pow(multG, 1/(size*size));
			pixel.b = Math.pow(multB, 1/(size*size));

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var geomeanImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(geomeanImage, 0, 0);
}

function harmonicMean(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var sumR = 0;
			var sumG = 0;
			var sumB = 0;

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						sumR += 1/pixel.r;
						sumG += 1/pixel.g;
						sumB += 1/pixel.b;

					}
				}
			}

			var pixel = imageMatrix[linha][coluna];
			pixel.r = (size*size)/sumR;
			pixel.g = (size*size)/sumG;
			pixel.b = (size*size)/sumB;

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var harmonicMeanImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(harmonicMeanImage, 0, 0);
}

function contraHarmonicMean(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;
	var q = parseInt(document.getElementById("q").value);

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var sumR = 0;
			var sumR2 = 0;
			var sumG = 0;
			var sumG2 = 0;
			var sumB = 0;
			var sumB2 = 0;

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						sumR += Math.pow(pixel.r, q+1);
						sumR2 += Math.pow(pixel.r, q);
						sumG += Math.pow(pixel.g, q+1);
						sumG2 += Math.pow(pixel.g, q);
						sumB += Math.pow(pixel.b, q+1);
						sumB2 += Math.pow(pixel.b, q);

					}
				}
			}

			var pixel = imageMatrix[linha][coluna];
			pixel.r = sumR/sumR2;
			pixel.g = sumG/sumG2;
			pixel.b = sumB/sumB2;

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var contraHarmonicMeanImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(contraHarmonicMeanImage, 0, 0);
}

function maximumFilter(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var listaR = [];
			var listaG = [];
			var listaB = [];

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						listaR.push(pixel.r);
						listaG.push(pixel.g);
						listaB.push(pixel.b);

					}
				}
			}

			var maxR = listaR.reduce(function(a, b) {
  				return Math.max(a, b);
			});
			var maxG = listaG.reduce(function(a, b) {
  				return Math.max(a, b);
			});
			var maxB = listaB.reduce(function(a, b) {
  				return Math.max(a, b);
			});

			var pixel = imageMatrix[linha][coluna];
			pixel.r = maxR;
			pixel.g = maxG;
			pixel.b = maxB;

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var maximumImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(maximumImage, 0, 0);
}

function minimumFilter(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var listaR = [];
			var listaG = [];
			var listaB = [];

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						listaR.push(pixel.r);
						listaG.push(pixel.g);
						listaB.push(pixel.b);

					}
				}
			}

			var minR = listaR.reduce(function(a, b) {
  				return Math.min(a, b);
			});
			var minG = listaG.reduce(function(a, b) {
  				return Math.min(a, b);
			});
			var minB = listaB.reduce(function(a, b) {
  				return Math.min(a, b);
			});

			var pixel = imageMatrix[linha][coluna];
			pixel.r = minR;
			pixel.g = minG;
			pixel.b = minB;

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var minimumImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(minimumImage, 0, 0);
}

function midpointFilter(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var size = document.getElementById("tamanho").value;

	if (size % 2 == 0){
		size += 1;
	}

	var dist = (size - 1) / 2;

	for (var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			
			var listaR = [];
			var listaG = [];
			var listaB = [];

			for (var i = 0; i < size; i++){
				for (var j = 0; j < size; j++){
					
					var indexLinha = linha - dist + i;
					var indexColuna = coluna - dist + j;

					if (indexLinha >= 0 && indexLinha < imageHeight && indexColuna >= 0 && indexColuna < imageWidth){
						var pixel = originalImageMatrix[indexLinha][indexColuna];

						listaR.push(pixel.r);
						listaG.push(pixel.g);
						listaB.push(pixel.b);

					}
				}
			}

			var minR = listaR.reduce(function(a, b) {
  				return Math.min(a, b);
			});
			var minG = listaG.reduce(function(a, b) {
  				return Math.min(a, b);
			});
			var minB = listaB.reduce(function(a, b) {
  				return Math.min(a, b);
			});

			var maxR = listaR.reduce(function(a, b) {
  				return Math.max(a, b);
			});
			var maxG = listaG.reduce(function(a, b) {
  				return Math.max(a, b);
			});
			var maxB = listaB.reduce(function(a, b) {
  				return Math.max(a, b);
			});

			var pixel = imageMatrix[linha][coluna];
			pixel.r = (minR + maxR)/2;
			pixel.g = (minG + maxG)/2;
			pixel.b = (minB + maxB)/2;

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var midpointImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(midpointImage, 0, 0);
}

function frequencyDomain(){
	//var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	var frequencyHeight = imageHeight * 2;
	var frequencyWidth = imageWidth * 2;

	var frequencyMatrix = [];


	for (var linha = 0; linha < frequencyHeight; linha++){
		var pixelArray = [];
		for (var coluna = 0; coluna < frequencyWidth; coluna++){

			var pixel = new Pixel(0, 0, 0, 255);
			pixelArray.push(pixel);
			
			
			//x.push(pixel.r);
		}
		frequencyMatrix.push(pixelArray);
	}

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = frequencyMatrix[linha][coluna];
			var pixel2 = imageMatrix[linha][coluna];

			pixel.r = pixel2.r;
			pixel.g = pixel2.g;
			pixel.b = pixel2.b;

			//x.push(pixel.r);
		}
	}

	for (var linha = 0; linha < frequencyHeight; linha++){
		for (var coluna = 0; coluna < frequencyWidth; coluna++){

			var pixel = frequencyMatrix[linha][coluna];
			pixel.r *= Math.pow(-1, linha+coluna);
			pixel.g *= Math.pow(-1, linha+coluna);
			pixel.b *= Math.pow(-1, linha+coluna);
			
			
		}
	}

	/*
	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data); */


	var frequencyImage = matrixToImage(frequencyMatrix, frequencyWidth, frequencyHeight);
	//console.log(frequencyImage);

	var frequencyTransform = [];

	Fourier.transform(frequencyImage, frequencyTransform);
	Fourier.filter(frequencyTransform, [600,400]);

	var finalTransform = [];

	Fourier.invert(frequencyTransform, finalTransform);

	console.log(finalTransform);




	ctx.putImageData(frequencyImage, 0, 0);
}

function colorConverter(component){
	if (component == "RGB"){
		var r = parseInt(document.getElementById("r").value);
		var g = parseInt(document.getElementById("g").value);
		var b = parseInt(document.getElementById("b").value);

		document.getElementById("comp-r").textContent = "Red: " + r;
		document.getElementById("comp-g").textContent = "Green: " + g;
		document.getElementById("comp-b").textContent = "Blue: " + b;

		document.getElementById("color").style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";

		convertRGBToCMY(r, g, b);
		convertRGBToHSI(r, g, b);

	} else if (component == "CMY"){

		var c = parseInt(document.getElementById("c").value);
		var m = parseInt(document.getElementById("m").value);
		var y = parseInt(document.getElementById("y").value);

		document.getElementById("comp-c").textContent = "Cyan: " + c;
		document.getElementById("comp-m").textContent = "Magenta: " + m;
		document.getElementById("comp-y").textContent = "Yellow: " + y;

		convertCMYToRGB(c, m, y);
		convertCMYToHSI(c, m, y);

	} else if (component == "HSI"){

		var h = parseInt(document.getElementById("h").value);
		var s = parseInt(document.getElementById("s").value);
		var i = parseInt(document.getElementById("i").value);

		document.getElementById("comp-h").textContent = "Hue: " + h;
		document.getElementById("comp-s").textContent = "Saturation: " + s;
		document.getElementById("comp-i").textContent = "Intensity: " + i;

		convertHSIToRGB(h, s, i);
		convertHSIToCMY(h, s, i);
	}
}

function convertRGBToCMY(r, g, b){
	var c = 255 - r;
	var m = 255 - g;
	var y = 255 - b;

	document.getElementById("c").value = c;
	document.getElementById("m").value = m;
	document.getElementById("y").value = y;

	document.getElementById("comp-c").textContent = "Cyan: " + c;
	document.getElementById("comp-m").textContent = "Magenta: " + m;
	document.getElementById("comp-y").textContent = "Yellow: " + y;
}

function convertCMYToRGB(c, m, y){
	var r = 255 - c;
	var g = 255 - m;
	var b = 255 - y;

	document.getElementById("r").value = r;
	document.getElementById("g").value = g;
	document.getElementById("b").value = b;

	document.getElementById("comp-r").textContent = "Red: " + r;
	document.getElementById("comp-g").textContent = "Green: " + g;
	document.getElementById("comp-b").textContent = "Blue: " + b;

	document.getElementById("color").style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
}

function convertRGBToHSI(r, g, b){
	var rNorm = r / (r + g + b);
	var gNorm = g / (r + g + b);
	var bNorm = b / (r + g + b);

	if (b <= g){
		var p1 = 0.5 * ((rNorm - gNorm) + (rNorm - bNorm));
		var p2 = Math.sqrt((rNorm - gNorm)**2 + (rNorm - bNorm)*(gNorm - bNorm));
		var h = Math.acos(p1/p2);
	} else {
		var p1 = 0.5 * ((rNorm - gNorm) + (rNorm - bNorm));
		var p2 = Math.sqrt((rNorm - gNorm)**2 + (rNorm - bNorm)*(gNorm - bNorm));
		var h = 2*(Math.PI) - Math.acos(p1/p2);
	}

	var s = 1 - 3 * Math.min(rNorm, gNorm, bNorm);
	var i = (r + g + b)/(3 * 255);

	h = h * 180/(Math.PI);
	s *= 100;
	i *= 255;

	(isNaN(h) == true) ? h = 0 : '';
	(isNaN(s) == true) ? s = 0 : '';
	(isNaN(i) == true) ? i = 0 : '';

	h = Math.round(h);
	s = Math.round(s);
	i = Math.round(i);

	document.getElementById("h").value = h;
	document.getElementById("s").value = s;
	document.getElementById("i").value = i;

	document.getElementById("comp-h").textContent = "Hue: " + h;
	document.getElementById("comp-s").textContent = "Saturation: " + s;
	document.getElementById("comp-i").textContent = "Intensity: " + i;
}

function convertCMYToHSI(c, m, y){
	var r = 255 - c;
	var g = 255 - m;
	var b = 255 - y;


	var rNorm = r / (r + g + b);
	var gNorm = g / (r + g + b);
	var bNorm = b / (r + g + b);

	if (b <= g){
		var p1 = 0.5 * ((rNorm - gNorm) + (rNorm - bNorm));
		var p2 = Math.sqrt((rNorm - gNorm)**2 + (rNorm - bNorm)*(gNorm - bNorm));
		var h = Math.acos(p1/p2);
	} else {
		var p1 = 0.5 * ((rNorm - gNorm) + (rNorm - bNorm));
		var p2 = Math.sqrt((rNorm - gNorm)**2 + (rNorm - bNorm)*(gNorm - bNorm));
		var h = 2*(Math.PI) - Math.acos(p1/p2);
	}

	var s = 1 - 3 * Math.min(rNorm, gNorm, bNorm);
	var i = (r + g + b)/(3 * 255);

	h = h * 180/(Math.PI);
	s *= 100;
	i *= 255;

	(isNaN(h) == true) ? h = 0 : '';
	(isNaN(s) == true) ? s = 0 : '';
	(isNaN(i) == true) ? i = 0 : '';

	h = Math.round(h);
	s = Math.round(s);
	i = Math.round(i);

	document.getElementById("h").value = h;
	document.getElementById("s").value = s;
	document.getElementById("i").value = i;

	document.getElementById("comp-h").textContent = "Hue: " + h;
	document.getElementById("comp-s").textContent = "Saturation: " + s;
	document.getElementById("comp-i").textContent = "Intensity: " + i;
}

function convertHSIToRGB(h, s, i){
	h = h * (Math.PI)/180;
	s = s/100;
	i = i/255;

	if (h < 2*(Math.PI)/3){
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = y;
		var g = z;
		var b = x;
	} else if (h >= 2*(Math.PI)/3 && h < 4*(Math.PI)/3){
		h = h - 2*(Math.PI)/3;
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = x;
		var g = y;
		var b = z;
	} else if (h >= 4*(Math.PI)/3 && h <= 2*(Math.PI)){
		h = h - 4*(Math.PI)/3;
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = z;
		var g = x;
		var b = y;
	}

	r *= 255;
	g *= 255;
	b *= 255;

	r = Math.round(r);
	g = Math.round(g);
	b = Math.round(b);

	(isNaN(r) == true) ? r = 0 : '';
	(isNaN(g) == true) ? g = 0 : '';
	(isNaN(b) == true) ? b = 0 : '';

	document.getElementById("r").value = r;
	document.getElementById("g").value = g;
	document.getElementById("b").value = b;

	document.getElementById("comp-r").textContent = "Red: " + r;
	document.getElementById("comp-g").textContent = "Green: " + g;
	document.getElementById("comp-b").textContent = "Blue: " + b;

	document.getElementById("color").style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
}

function convertHSIToCMY(h, s, i){
	h = h * (Math.PI)/180;
	s = s/100;
	i = i/255;

	if (h < 2*(Math.PI)/3){
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = y;
		var g = z;
		var b = x;
	} else if (h >= 2*(Math.PI)/3 && h < 4*(Math.PI)/3){
		h = h - 2*(Math.PI)/3;
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = x;
		var g = y;
		var b = z;
	} else if (h >= 4*(Math.PI)/3 && h <= 2*(Math.PI)){
		h = h - 4*(Math.PI)/3;
		var x = i*(1 - s);
		x = Math.min(x,1);
		var y = i*(1 + ((s*Math.cos(h))/(Math.cos(((Math.PI)/3) - h))));
		y = Math.min(y,1);
		var z = 3*i - (x + y);
		z = Math.min(z,1);

		var r = z;
		var g = x;
		var b = y;
	}

	r *= 255;
	g *= 255;
	b *= 255;

	var c = Math.round(255 - r);
	var m = Math.round(255 - g);
	var y = Math.round(255 - b);

	(isNaN(c) == true) ? c = 0 : '';
	(isNaN(m) == true) ? m = 0 : '';
	(isNaN(y) == true) ? y = 0 : '';

	document.getElementById("c").value = c;
	document.getElementById("m").value = m;
	document.getElementById("y").value = y;

	document.getElementById("comp-c").textContent = "Cyan: " + c;
	document.getElementById("comp-m").textContent = "Magenta: " + m;
	document.getElementById("comp-y").textContent = "Yellow: " + y;
}

function sepia(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];

			var tr = (0.393 * pixel.r) + (0.769 * pixel.g) + (0.189 * pixel.b);
			var tg = (0.349 * pixel.r) + (0.686 * pixel.g) + (0.168 * pixel.b);
			var tb = (0.272 * pixel.r) + (0.534 * pixel.g) + (0.131 * pixel.b);

			tr = Math.round(tr);
			tg = Math.round(tg);
			tb = Math.round(tb);

			if (tr > 255){
				pixel.r = 255;
			} else {
				pixel.r = tr;
			}
			if (tg > 255){
				pixel.g = 255;
			} else {
				pixel.g = tg;
			}
			if (tb > 255){
				pixel.b = 255;
			} else {
				pixel.b = tb;
			}

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var sepiaImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(sepiaImage, 0, 0);
}

function upBrightness(){

	var x = [];


	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			var rTemp = pixel.r + 25;
			var gTemp = pixel.g + 25;
			var bTemp = pixel.b + 25;

			pixel.r = rTemp;
			pixel.g = gTemp;
			pixel.b = bTemp;

			/*

			if (rTemp >= 0 && rTemp <= 255){
				pixel.r = rTemp;
			}
			if (gTemp >= 0 && gTemp <= 255){
				pixel.g = gTemp;
			}
			if (bTemp >= 0 && bTemp <= 255){
				pixel.b = bTemp;
			} */

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var upBrightImage = matrixToImage(imageCanvas, imageWidth, imageHeight);
	ctx.putImageData(upBrightImage, 0, 0);
}

function downBrightness(){

	var x = [];


	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];

			var rTemp = pixel.r - 25;
			var gTemp = pixel.g - 25;
			var bTemp = pixel.b - 25;

			pixel.r = rTemp;
			pixel.g = gTemp;
			pixel.b = bTemp;

			/*

			if (rTemp >= 0 && rTemp <= 255){
				pixel.r = rTemp;
			}
			if (gTemp >= 0 && gTemp <= 255){
				pixel.g = gTemp;
			}
			if (bTemp >= 0 && bTemp <= 255){
				pixel.b = bTemp;
			}

			*/

			x.push(pixel.r);
		}
	}

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var downBrightImage = matrixToImage(imageCanvas, imageWidth, imageHeight);
	ctx.putImageData(downBrightImage, 0, 0);
}

function resetImage(){

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageCanvas[linha][coluna];
			var pixel2 = originalImageMatrix[linha][coluna];

			pixel.r = pixel2.r;
			pixel.g = pixel2.g;
			pixel.b = pixel2.b;

			imageCanvas[linha][coluna] = pixel;
		}
	}

	var resetImage = matrixToImage(imageCanvas, imageWidth, imageHeight);
	ctx.putImageData(resetImage, 0, 0);
}

function reduceGreen(image){
	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = image[linha][coluna];

			var rNorm = pixel.r / 255;
			var gNorm = pixel.g / 255;
			var bNorm = pixel.b / 255;

			var cMax = Math.max(rNorm, gNorm, bNorm);
			var cMin = Math.min(rNorm, gNorm, bNorm);
			var delta = cMax - cMin;

			if (delta == 0){
				var h = 0;
			} else if (cMax == rNorm){
				var h = 60 * (((gNorm - bNorm)/delta) % 6);
			} else if (cMax == gNorm){
				var h = 60 * ((bNorm - rNorm)/delta + 2);
			} else if (cMax == bNorm){
				var h = 60 * ((rNorm - gNorm)/delta + 4);
			}

			if (cMax == 0){
				var s = 0;
			} else {
				var s = delta/cMax;
			}

			var v = cMax;

			if (h >= 60 && h <= 130 && s >= 0.15 && v >= 0.15){
				if((pixel.r * pixel.b) != 0 && (pixel.g * pixel.g) / (pixel.r * pixel.b) > 1.5){
					pixel.r *= 1.4;
					pixel.b *= 1.4;
				} else{
					pixel.r *= 1.2;
					pixel.b *= 1.2;
				}
			}
		}
	}

	return image;
}

function chromaKey(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];
			var pixel2 = originalImageMatrix2[linha][coluna];

			var rNorm = pixel.r / 255;
			var gNorm = pixel.g / 255;
			var bNorm = pixel.b / 255;

			var cMax = Math.max(rNorm, gNorm, bNorm);
			var cMin = Math.min(rNorm, gNorm, bNorm);
			var delta = cMax - cMin;

			if (delta == 0){
				var h = 0;
			} else if (cMax == rNorm){
				var h = 60 * (((gNorm - bNorm)/delta) % 6);
			} else if (cMax == gNorm){
				var h = 60 * ((bNorm - rNorm)/delta + 2);
			} else if (cMax == bNorm){
				var h = 60 * ((rNorm - gNorm)/delta + 4);
			}

			if (cMax == 0){
				var s = 0;
			} else {
				var s = delta/cMax;
			}

			var v = cMax;

			if (h >= 60 && h <= 130 && s >= 0.4 && v >= 0.3){
				pixel.r = pixel2.r;
				pixel.g = pixel2.g;
				pixel.b = pixel2.b;
			}

			x.push(pixel.r);
		}
	}

	imageMatrix = reduceGreen(imageMatrix);

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var chromaImage = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(chromaImage, 0, 0);
}

function subtractImage(){

	var x = [];

	var imageMatrix = JSON.parse(JSON.stringify(originalImageMatrix));
	//var imageMatrix2 = JSON.parse(JSON.stringify(originalImageMatrix2));

	for(var linha = 0; linha < imageHeight; linha++){
		for (var coluna = 0; coluna < imageWidth; coluna++){
			var pixel = imageMatrix[linha][coluna];
			var pixel2 = originalImageMatrix2[linha][coluna];

			var red = pixel.r - pixel2.r;
			var green = pixel.g - pixel2.g;
			var blue = pixel.b - pixel2.b;

			red += 255;
			green += 255;
			blue += 255;

			red /= 2;
			green /= 2;
			blue /= 2;

			pixel.r = red;
			pixel.g = green;
			pixel.b = blue;

			x.push(pixel.r);
		}
	}

	

	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

	var Quadrant = matrixToImage(imageMatrix, imageWidth, imageHeight);
	ctx.putImageData(Quadrant, 0, 0);
}

function haarTransform(){

	var x = [];

	var imageMatrixPrevious = JSON.parse(JSON.stringify(imageCanvas));
	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageCanvas));
	var imageMatrixNew = JSON.parse(JSON.stringify(imageCanvas));

	  for(var linha = 0; linha < haarHeight; linha++)
	  {
	    for(var coluna = 0; coluna < haarWidth; coluna+=2)
	    {
	      var firstPixel = imageMatrixCurrent[linha][coluna];
	      var secondPixel = imageMatrixCurrent[linha][coluna + 1];

	      var escalaR = ( firstPixel.r + secondPixel.r ) / 2;
	      var escalaG = ( firstPixel.g + secondPixel.g ) / 2;
	      var escalaB = ( firstPixel.b + secondPixel.b ) / 2;

	      var coefDetR = ( firstPixel.r - secondPixel.r ) / 2;
	      var coefDetG = ( firstPixel.g - secondPixel.g ) / 2;
	      var coefDetB = ( firstPixel.b - secondPixel.b ) / 2;

	      var indexMediaCol = coluna / 2;
	      var indexSubCol = ( coluna / 2 ) + ( haarWidth / 2 );

	      var currentPixelEscala = imageMatrixNew[linha][indexMediaCol];
	      var currentPixelCoefDet = imageMatrixNew[linha][indexSubCol];

	      currentPixelEscala.r = escalaR;
	      currentPixelEscala.g = escalaG;
	      currentPixelEscala.b = escalaB;

	      currentPixelCoefDet.r = coefDetR;
	      currentPixelCoefDet.g = coefDetG;
	      currentPixelCoefDet.b = coefDetB;

	    }
	  }
	

	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageMatrixNew));

	for(var coluna = 0; coluna < haarWidth; coluna++)
	  {
	    for(var linha = 0; linha < haarHeight; linha+=2)
	    {
	      var firstPixel = imageMatrixCurrent[linha][coluna];
	      var secondPixel = imageMatrixCurrent[linha + 1][coluna];

	      var escalaR = ( firstPixel.r + secondPixel.r ) / 2;
	      var escalaG = ( firstPixel.g + secondPixel.g ) / 2;
	      var escalaB = ( firstPixel.b + secondPixel.b ) / 2;

	      var coefDetR = ( firstPixel.r - secondPixel.r ) / 2;
	      var coefDetG = ( firstPixel.g - secondPixel.g ) / 2;
	      var coefDetB = ( firstPixel.b - secondPixel.b ) / 2;

	      var indexMediaLine = linha / 2;
	      var indexSubLine = ( linha / 2 ) + ( haarHeight / 2 );

	      var currentPixelEscala = imageMatrixNew[indexMediaLine][coluna];
	      var currentPixelCoefDet = imageMatrixNew[indexSubLine][coluna];

	      currentPixelEscala.r = escalaR;
	      currentPixelEscala.g = escalaG;
	      currentPixelEscala.b = escalaB;

	      currentPixelCoefDet.r = coefDetR;
	      currentPixelCoefDet.g = coefDetG;
	      currentPixelCoefDet.b = coefDetB;

	    }
	  }

	
	imageCanvas = JSON.parse(JSON.stringify(imageMatrixNew));

	var haarImage = matrixToImage(imageMatrixNew, imageWidth, imageHeight);
	ctx.putImageData(haarImage, 0, 0);

 	haarHeight = haarHeight/2;
	haarWidth = haarWidth/2;


	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}

function energyHaar(imageMatrix,imageWidthBegin, imageWidthEnd, imageHeightBegin, imageHeightEnd){

	var x = [];

	var imageMatrixPrevious = JSON.parse(JSON.stringify(imageMatrix));
	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageMatrix));
	var imageMatrixNew = JSON.parse(JSON.stringify(imageMatrix));

	  for(var linha = imageHeightBegin; linha <= imageHeightEnd; linha++)
	  {
	    for(var coluna = imageWidthBegin ; coluna <= imageWidthEnd; coluna+=2)
	    {
	      var firstPixel = imageMatrixCurrent[linha][coluna];
	      var secondPixel = imageMatrixCurrent[linha][coluna + 1];

	      var escalaR = ( firstPixel.r + secondPixel.r ) / 2;
	      var escalaG = ( firstPixel.g + secondPixel.g ) / 2;
	      var escalaB = ( firstPixel.b + secondPixel.b ) / 2;

	      var coefDetR = ( firstPixel.r - secondPixel.r ) / 2;
	      var coefDetG = ( firstPixel.g - secondPixel.g ) / 2;
	      var coefDetB = ( firstPixel.b - secondPixel.b ) / 2;

	      var indexMediaCol = ((coluna - imageWidthBegin) / 2 ) + imageWidthBegin;
      	  var indexSubCol = ((coluna - imageWidthBegin) / 2 ) + ( (imageWidthEnd - imageWidthBegin + 1) / 2 ) + imageWidthBegin;

	      var currentPixelEscala = imageMatrixNew[linha][indexMediaCol];
	      var currentPixelCoefDet = imageMatrixNew[linha][indexSubCol];

	      currentPixelEscala.r = escalaR;
	      currentPixelEscala.g = escalaG;
	      currentPixelEscala.b = escalaB;

	      currentPixelCoefDet.r = coefDetR;
	      currentPixelCoefDet.g = coefDetG;
	      currentPixelCoefDet.b = coefDetB;

	    }
	  }
	

	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageMatrixNew));

	for(var coluna = imageWidthBegin; coluna <= imageWidthEnd; coluna++)
	  {
	    for(var linha = imageHeightBegin; linha <= imageHeightEnd; linha+=2)
	    {
	      var firstPixel = imageMatrixCurrent[linha][coluna];
	      var secondPixel = imageMatrixCurrent[linha + 1][coluna];

	      var escalaR = ( firstPixel.r + secondPixel.r ) / 2;
	      var escalaG = ( firstPixel.g + secondPixel.g ) / 2;
	      var escalaB = ( firstPixel.b + secondPixel.b ) / 2;

	      var coefDetR = ( firstPixel.r - secondPixel.r ) / 2;
	      var coefDetG = ( firstPixel.g - secondPixel.g ) / 2;
	      var coefDetB = ( firstPixel.b - secondPixel.b ) / 2;

	      var indexMediaLine = ((linha - imageHeightBegin) / 2 ) + imageHeightBegin;
      	  var indexSubLine = ((linha - imageHeightBegin) / 2 ) + ( (imageHeightEnd - imageHeightBegin + 1) / 2 ) + imageHeightBegin;


	      var currentPixelEscala = imageMatrixNew[indexMediaLine][coluna];
	      var currentPixelCoefDet = imageMatrixNew[indexSubLine][coluna];

	      currentPixelEscala.r = escalaR;
	      currentPixelEscala.g = escalaG;
	      currentPixelEscala.b = escalaB;

	      currentPixelCoefDet.r = coefDetR;
	      currentPixelCoefDet.g = coefDetG;
	      currentPixelCoefDet.b = coefDetB;

	    }
	  }

	  return imageMatrixNew;
}

function energyIsBigger(imageMatrixPrevious, imageMatrixNew, imageWidthBegin, imageWidthEnd, imageHeightBegin, imageHeightEnd) {
  var matrixPreviousEnergy = 0;
  var matrixNewEnergy = 0;

  // Calcula energia da matriz Previous
  for(var linha = imageHeightBegin; linha <= imageHeightEnd; linha++)
  {
    for(var coluna = imageWidthBegin; coluna <= imageWidthEnd; coluna++)
    {
      var currentPixelPrevious = imageMatrixPrevious[linha][coluna];
      var currentPixelNew = imageMatrixNew[linha][coluna];
      
      matrixPreviousEnergy += currentPixelPrevious.r + currentPixelPrevious.g + currentPixelPrevious.b;
      matrixNewEnergy += currentPixelNew.r + currentPixelNew.g + currentPixelNew.b;
    }
  }

  if(matrixNewEnergy < matrixPreviousEnergy)
  {
    return false;
  }
  else
  {
    return true;
  }
}

function applyWaveletFilterMatrix() {

  var x = [];

  var subImagesArrayAtual = [];
  var subImagesArrayNovo = [];

  subImagesArrayAtual.push(new Quadrant(0, haarWidth - 1, 0, haarHeight - 1));

  var imageMatrixPrevious = JSON.parse(JSON.stringify(originalImageMatrix));

  var maxInteration = 2;
  var currentInteration = 0;

 
while(subImagesArrayAtual.length > 0 && currentInteration < maxInteration)
  {

    for(var i = 0; i < subImagesArrayAtual.length; i++)
    {
      var currentSubImage = subImagesArrayAtual[i];
      var imageMatrixNew = energyHaar(imageMatrixPrevious, currentSubImage.imageWidthBegin, currentSubImage.imageWidthEnd, currentSubImage.imageHeightBegin, currentSubImage.imageHeightEnd);
    
      // Verifica se a energia New é menor que a Previous
      if(!energyIsBigger(imageMatrixPrevious, imageMatrixNew, currentSubImage.imageWidthBegin, currentSubImage.imageWidthEnd, currentSubImage.imageHeightBegin, currentSubImage.imageHeightEnd))
      {
        // Subimagem do 1º quadrante
        subImagesArrayNovo.push(new Quadrant(
          currentSubImage.imageWidthBegin, 
          ((currentSubImage.imageWidthEnd - currentSubImage.imageWidthBegin + 1) / 2) - 1,
          currentSubImage.imageHeightBegin,
          ((currentSubImage.imageHeightEnd - currentSubImage.imageHeightBegin + 1) / 2) - 1
        ));

        // Subimagem do 2º quadrante
        subImagesArrayNovo.push(new Quadrant(
          currentSubImage.imageWidthBegin, 
          ((currentSubImage.imageWidthEnd - currentSubImage.imageWidthBegin + 1) / 2) - 1,
          ((currentSubImage.imageHeightEnd - currentSubImage.imageHeightBegin + 1) / 2),
          currentSubImage.imageHeightEnd
        ));

        // Subimagem do 3º quadrante
        subImagesArrayNovo.push(new Quadrant(
          ((currentSubImage.imageWidthEnd - currentSubImage.imageWidthBegin + 1) / 2), 
          currentSubImage.imageWidthEnd,
          ((currentSubImage.imageHeightEnd - currentSubImage.imageHeightBegin + 1) / 2),
          currentSubImage.imageHeightEnd
        ));

        // Subimagem do 4º quadrante
        subImagesArrayNovo.push(new Quadrant(
          ((currentSubImage.imageWidthEnd - currentSubImage.imageWidthBegin + 1) / 2), 
          currentSubImage.imageWidthEnd,
          currentSubImage.imageHeightBegin,
          ((currentSubImage.imageHeightEnd - currentSubImage.imageHeightBegin + 1) / 2) - 1
        ));

        var imageMatrixPrevious = JSON.parse(JSON.stringify(imageMatrixNew));
      }

    }

    subImagesArrayAtual = JSON.parse(JSON.stringify(subImagesArrayNovo));
    subImagesArrayNovo = [];

    currentInteration++;
  }

  var imageMatrixNew = JSON.parse(JSON.stringify(imageMatrixPrevious));

  var haarImage = matrixToImage(imageMatrixNew, imageWidth, imageHeight);
  ctx.putImageData(haarImage, 0, 0);


	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);

}

function applyWavelet(){
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	haarTransform();
	console.log(haarWidth);
	console.log(haarHeight);
}

function haarInverse(){

	var x = [];

	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageCanvas));
	var imageMatrixNew = JSON.parse(JSON.stringify(imageCanvas));

	for(var linha = 0; linha < haarHeight*2; linha++){
	  	var atual = 0;
	    for(var coluna = 0; coluna < haarWidth; coluna++){
	    	var pixel = imageMatrixCurrent[linha][coluna];
	    	var pixel2 = imageMatrixCurrent[linha][coluna+haarWidth];

	    	var somaR = pixel.r + pixel2.r;
	    	var subR = pixel.r - pixel2.r;
	    	var somaG = pixel.g + pixel2.g;
	    	var subG = pixel.g - pixel2.g;
	    	var somaB = pixel.b + pixel2.b;
	    	var subB = pixel.b - pixel2.b;

	    	var pixelFinal1 = imageMatrixNew[linha][atual];
	    	var pixelFinal2 = imageMatrixNew[linha][atual+1];

	    	pixelFinal1.r = somaR;
	    	pixelFinal1.g = somaG;
	    	pixelFinal1.b = somaB;
	    	pixelFinal2.r = subR;
	    	pixelFinal2.g = subG;
	    	pixelFinal2.b = subB;

	    	atual += 2;
	    }
	}
	
	
	var imageMatrixCurrent = JSON.parse(JSON.stringify(imageMatrixNew));

	for(var coluna = 0; coluna < haarWidth*2; coluna++){
	  	var atual = 0;
	    for(var linha = 0; linha < haarHeight; linha++){
	    	var pixel = imageMatrixCurrent[linha][coluna];
	    	var pixel2 = imageMatrixCurrent[linha+haarHeight][coluna];

	    	var somaR = pixel.r + pixel2.r;
	    	var subR = pixel.r - pixel2.r;
	    	var somaG = pixel.g + pixel2.g;
	    	var subG = pixel.g - pixel2.g;
	    	var somaB = pixel.b + pixel2.b;
	    	var subB = pixel.b - pixel2.b;

	    	var pixelFinal1 = imageMatrixNew[atual][coluna];
	    	var pixelFinal2 = imageMatrixNew[atual+1][coluna];

	    	pixelFinal1.r = somaR;
	    	pixelFinal1.g = somaG;
	    	pixelFinal1.b = somaB;
	    	pixelFinal2.r = subR;
	    	pixelFinal2.g = subG;
	    	pixelFinal2.b = subB;

	    	atual += 2;
	    }
	}
	
	
	imageCanvas = JSON.parse(JSON.stringify(imageMatrixNew));

	var haarImage = matrixToImage(imageMatrixNew, imageWidth, imageHeight);
	ctx.putImageData(haarImage, 0, 0);

 	haarHeight = haarHeight*2;
	haarWidth = haarWidth*2;

	console.log(haarWidth);
	console.log(haarHeight);


	var trace = {
		x: x,
		type: 'histogram',
	};
	var data = [trace];
	Plotly.newPlot('histograma', data);
}