const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pixelBtn = document.getElementById("pixelBtn");
const downloadBtn = document.getElementById("downloadBtn");

let img = new Image();

upload.addEventListener("change", function(e){

const file = e.target.files[0];
const reader = new FileReader();

reader.onload = function(event){
img.src = event.target.result;
};

reader.readAsDataURL(file);

});

img.onload = function(){

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(img,0,0);

};

pixelBtn.addEventListener("click", pixelate);
downloadBtn.addEventListener("click", downloadImage);

function pixelate(){

let size = 10; // pixel size

let w = canvas.width / size;
let h = canvas.height / size;

// draw small version
ctx.drawImage(img,0,0,w,h);

// scale back to original size
ctx.imageSmoothingEnabled = false;
ctx.drawImage(canvas,0,0,w,h,0,0,canvas.width,canvas.height);

}

function downloadImage(){

const link = document.createElement("a");
link.download = "pixel-photo.png";
link.href = canvas.toDataURL();
link.click();

}