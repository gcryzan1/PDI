// variáveis globais que representam respectivamente o canvas, o objeto contexto 2D do canvas, a largura e altura da imagem setadas no css, a matriz de pixels da imagem original e a matriz de pixels da imagem que está atualmente no canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var imageWidth;
var imageHeight;
var originalImageMatrix;
var imageCanvas;

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

	console.log(imageMatrix);
	console.log(frequencyMatrix);

	var frequencyImage = matrixToImage(frequencyMatrix, frequencyWidth, frequencyHeight);
	ctx.putImageData(frequencyImage, 0, 0);
}