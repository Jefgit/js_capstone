let mediaRecorder;
let recordedBlobs;
let img_name;
let img_exist;
let is_recording;

const displayVideo    = document.getElementById('video');
const checkbox        = document.getElementById('checkbox');
const myForm          = document.getElementById('myForm');
const file            = document.getElementById('file');
const watch           = document.getElementById('watch');
const icon_upload     = document.getElementById('icon_upload');
const upload          = document.getElementById('upload');
const image           = document.getElementById('image');
const add_bg          = document.getElementById('add_bg');
const videoElement    = document.getElementById('video');
const canvas          = document.getElementById('canvas');
const output          = document.getElementById('output');
const background      = document.getElementById('background');
const errorMsgElement = document.getElementById('errorMsg');
const recordedVideo   = document.getElementById('recorded');
const recordButton    = document.getElementById('record');
const playButton      = document.getElementById('play');
const downloadButton  = document.getElementById('download');
const snapButton      = document.getElementById('screenShot');
const ctxImg          = canvas.getContext('2d');

add_bg.addEventListener('click', async () => { //add background event
  if(myForm.style.display == "block"){
    myForm.style.display = "none";
  }
  else{
    myForm.style.display = "block";
  }

});

file.onchange =  function(){ //preview image to upload
  var src = URL.createObjectURL(this.files[0]);
  image.src = src;
}

watch.addEventListener('click', async () => { //Replay or download recorded video event
  if(output.style.display == "block"){
    output.style.display = "none";
    console.log(recordedBlobs);

    if(recordedBlobs){
      const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
      recordedVideo.src = null;
      recordedVideo.srcObject = null;
      recordedVideo.src = window.URL.createObjectURL(superBuffer);   
    }
    
  }
  else{
    console.log(recordedBlobs);
   if(recordedBlobs){
      const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
      recordedVideo.src = null;
      recordedVideo.srcObject = null;
      recordedVideo.src = window.URL.createObjectURL(superBuffer);
    }
    output.style.display = "block";
  }

});

icon_upload.addEventListener('click', async () => {
  file.click();
});

checkbox.addEventListener('change', async () => {
  if(checkbox.checked){
    recordButton.disabled = false;
    snapButton.disabled = false;
    const constraints = {
      audio: {
        // echoCancellation: {exact: hasEchoCancellation}
      },
      video: {
        width: 480, height: 320  //set video screen dimension
      }
    };
      // console.log('Using media constraints:', constraints);
    await init(constraints);

  }
  else{
    window.stream.getTracks().forEach(function(track) {
      track.stop();
      displayVideo.srcObject = null;
    });

    background.hidden = true;
    displayVideo.hidden = false;
    canvas.hidden = true;

     recordButton.disabled = true;
     snapButton.disabled = true;
  }
  
});

async function init(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
      errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }

function handleSuccess(stream) {
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;
  displayVideo.srcObject = stream;
  snapButton.disabled = false;
  videoElement.play();
}

function stopStream(stream) { //close camera
  stream.getTracks().forEach(function(track) {
      if (track.readyState == 'live') {
          track.stop();
      }
  });
}

snapButton.addEventListener('click', () => { //when Take Snapshot button is clicked
  if($('#video').is(":hidden")){
    takeSnapshot();
  }
  else{
    takeSnapshot()
    .then(downloadPic);
  }
})

$('#record').addClass("notRec");

$('#record').click(function(){
	if($('#record').hasClass('notRec')){ //record
		$('#record').removeClass("notRec");
		$('#record').addClass("Rec");
    startRecording();
	}
	else{//stop recording
		$('#record').removeClass("Rec");
		$('#record').addClass("notRec");

    stopRecording();
    watch.style.color = "red";
    is_recording = false;
    playButton.disabled = false;
    downloadButton.disabled = false;
    output.hidden = false;
	}
});	

//for recording video
function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9,opus'};
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }
  
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  is_recording = true;
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

//for taking screenshot
function takeSnapshot(){
  if($('#video').is(":hidden")){
    let div = document.getElementById('container');
    let output = document.getElementById('output');
    
    html2canvas(div).then(function(canvas1) {
      canvas1.style.display = 'none';
      output.appendChild(canvas1);
      return canvas1;
    })
    .then(canvas1 => {
      const image = canvas1.toDataURL('image/jpg').replace('image/jpg', 'image/octet-stream')
      const a = document.createElement('a')
      a.setAttribute('download', "Screenshot"+Date.now()+".jpg")
      a.setAttribute('href', image)
      a.click()
      canvas1.remove()
    })
  }
  else{
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = displayVideo.videoWidth;
    canvas.height = displayVideo.videoHeight;
    ctx.drawImage(displayVideo,0,0);
    return new Promise((res,rej) =>{
    canvas.toBlob(res,"image/jpeg"); //assign filetype
    })
  }
 
}

//for downloading screenshot
function downloadPic(blob){
  if($('#video').is(":hidden")){
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "Screenshot.jpg"; //assign filename
    document.body.appendChild(a); 
    a.click();
  } 
  else{
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "Screenshot.jpg"; //assign filename
    document.body.appendChild(a); 
    a.click();
  }
}

//managing data 
function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

//make the recording stop
function stopRecording() {
  mediaRecorder.stop();
}

//for replaying recorded video
playButton.addEventListener('click', () => {
    recordedVideo.play();
});

//for downloading recorded video
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = "viduo"+Date.now()+".mp4";
  document.body.appendChild(a);
  a.click();
  output.hidden = true;
  recordedVideo.src = null;
  recordedBlobs = [];
  watch.style.color = "black";
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

//for speech recognition
var speechRecognition = window.webkitSpeechRecognition;
var recognition = new speechRecognition();
var textbox = $("#speech");
var instruction = $("#instruct");
var content = "";

recognition.continuos = true;

recognition.onstart = () => {
  instruction.text("Voice Recognition is on");
}

recognition.onspeechend = () => {
    instruction.text("No Activity");
}

recognition.onerror = () => {
  instruction.text("Try Again");
}

recognition.onresult = (event) => {
  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;

  content = transcript;
  textbox.text(content);

  let words = textbox.text().split(' ');
  let path = "url('../images/backgrounds/"+words[1]+"_bg.jpg')";

  if(textbox.text() == "blur background"){// set blurry background
    background.hidden = true;
    displayVideo.hidden = true;
    canvas.hidden = false;
    loadBodyPix();
  }
  else if(words[0] == "background"){
    checkImage("../images/backgrounds/"+words[1]+"_bg.jpg")
    .then((value) => {
      console.log(value);
      if(value){
        img_name = words[1];
        console.log( img_name);
        background.style.backgroundImage = path;
        background.hidden = false;
        displayVideo.hidden = true;
        canvas.hidden = false;
        canvas.width = videoElement.width;
        canvas.height = videoElement.height;

        ctxImg.drawImage(videoElement, 0, 0);
        removebackground();
      }
      else{
        background.hidden = true;
        displayVideo.hidden = false;
        canvas.hidden = true;
      }
    });
  }
  else{
    background.hidden = true;
    displayVideo.hidden = false;
    canvas.hidden = true;
  }

}

async function checkImage(url){
     
  const res = await fetch(url);
  const buff = await res.blob();
 
  return buff.type.startsWith('image/');

}

$("#start-btn").click((event) => {
    if(content.length) {
      content = '';

    }
    recognition.start();
})

textbox.on('input', () => {
  content = $(this).text();
});

displayVideo.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
};

//background filter
function loadBodyPix() {
  options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  }
  bodyPix.load(options)
    .then(net => perform(net))
    .catch(err => console.log(err))
}

async function perform(net) {
  
  while (textbox.text() == "blur background") {
    const segmentation = await net.segmentPerson(video);

    const backgroundBlurAmount = 5;
    const edgeBlurAmount = 2;
    const flipHorizontal = false;

    bodyPix.drawBokehEffect(
      canvas, videoElement, segmentation, backgroundBlurAmount,
      edgeBlurAmount, flipHorizontal);
  }
}

async function removebackground() {

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  while (textbox.text() == "background "+img_name) {
    // Loading the model
    const net = await bodyPix.load({
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
    });
  
    // Segmentation
    const { data:map } = await net.segmentPerson(videoElement, {
      flipHorizontal: true,
      internalResolution: 'medium',
      segmentationThreshold: 0.6
    });
  
    ctx.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    var imageData = ctx.getImageData(0,0, videoElement.width, videoElement.height);
    var pixel = imageData.data;
    for (var p = 0; p<pixel.length; p+=4){
      if (map[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
  
    // Draw the new image back to canvas
    ctx.imageSmoothingEnabled = true;
    ctx.putImageData(imageData, 0, 0);
  }
}
