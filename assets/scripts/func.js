//for webrtc
let mediaRecorder, recordedBlobs;
let img_name;
let img_exist;
let is_recording;
let displayVideo      = document.querySelector('video#video');
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
const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo   = document.querySelector('video#recorded');
const startButton     = document.querySelector('button#start');
const recordButton    = document.querySelector('button#record');
const playButton      = document.querySelector('button#play');
const downloadButton  = document.querySelector('button#download');
const snapButton      = document.querySelector('button#screenShot');

const ctxImg = canvas.getContext('2d');

file.onchange =  function(){
  var src = URL.createObjectURL(this.files[0]);
  image.src = src;
}

add_bg.addEventListener('click', async () => {
  if(myForm.style.display == "block"){
    myForm.style.display = "none";
  }
  else{
    myForm.style.display = "block";
  }

});

watch.addEventListener('click', async () => {
  if(output.style.display == "block"){
    output.style.display = "none";

    if(recordedBlobs){
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    try {
      recordedVideo.stop();
    } catch (error) {
      console.log(error);
    }
    
    }
    
  }
  else{
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
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
     // startButton.disabled = true;
        // const hasEchoCancellation = document.querySelector('#echoCancellation').checked; 
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
    // stream.getTracks().forEach(track => track.stop())
    // startButton.textContent = 'Start Camera';
     recordButton.disabled = true;
    snapButton.disabled = true;

  }
  
});
//when start button camera is clicked open camera view
// startButton.addEventListener('click', async () => {

//   if (startButton.textContent === 'Close Camera') {
//     window.stream.getTracks().forEach(function(track) {
//       track.stop();
//       displayVideo.srcObject = null;
//     });
//     // stream.getTracks().forEach(track => track.stop())
//     startButton.textContent = 'Start Camera';
//      recordButton.disabled = true;
//     snapButton.disabled = true;
//   }
//   else{
   
//     // startButton.disabled = true;
//         // const hasEchoCancellation = document.querySelector('#echoCancellation').checked; 
//       const constraints = {
//         audio: {
//           // echoCancellation: {exact: hasEchoCancellation}
//         },
//         video: {
//           width: 480, height: 320  //set video screen dimension
//         }
//       };
//       // console.log('Using media constraints:', constraints);
//     await init(constraints);
//   }
//   });

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
  
  // const displayVideo = document.querySelector('video#display');
  displayVideo.srcObject = stream;

  // if (startButton.textContent === 'Close Camera') {
  //   window.stream.getTracks().forEach(function(track) {
  //     track.stop();
  //     displayVideo.srcObject = null;
  //   });
  //   // stream.getTracks().forEach(track => track.stop())
  //   startButton.textContent = 'Start Camera';
  //    recordButton.disabled = true;
  //   snapButton.disabled = true;
  // }
  // else{
    recordButton.disabled = false;
    snapButton.disabled = false;
    // startButton.textContent = 'Close Camera';  
    videoElement.play();
  // }
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

//when record button is clicked
// recordButton.addEventListener('click', () => {
//   if (recordButton.textContent === 'Record') {
//     startRecording();
//   } else {
//     stopRecording();
//     watch.style.color = "red";
//     recordButton.textContent = 'Record';
//     playButton.disabled = false;
//     downloadButton.disabled = false;
//     output.hidden = false;
//   }
// });

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
    // recordButton.textContent = 'Record';
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
  // recordButton.textContent = 'Stop Recording';
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
    // const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    // recordedVideo.src = null;
    // recordedVideo.srcObject = null;
    // recordedVideo.src = window.URL.createObjectURL(superBuffer);
    // recordedVideo.controls = true;
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
// var stat = "";

recognition.continuos = true;

recognition.onstart = () => {
  instruction.text("Voice Recognition is on");
}

recognition.onspeechend = () => {
  // if(stat){
  //   instruction.text(stat);
  // }
  // else{
    instruction.text("No Activity");
  // }
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

  // if(textbox.text() == "snap"){
  //   if($('#video').is(":hidden")){
  //     takeSnapshot();
  //   }
  //   else{
  //     takeSnapshot()
  //     .then(downloadPic);
  //   }
  // }
  // else 
  if(textbox.text() == "blur background"){
    // stat = "Blurry background activated";
    background.hidden = true;
    displayVideo.hidden = true;
    canvas.hidden = false;
    loadBodyPix();
  }
  else if(words[0] == "background"){
    // stat = "";
    checkImage("../images/backgrounds/"+words[1]+"_bg.jpg")
    .then((value) => {
      console.log(value);
      if(value){
        // stat = "Background filter changed.";
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
        // stat = "Background filter not available";
        background.hidden = true;
        displayVideo.hidden = false;
        canvas.hidden = true;
      }
    });
  }
  else if(textbox.text() == "object"){
    canvas.hidden = false;
    canvas.width = 550;
    canvas.height = 500;
    displayVideo.hidden = true;
      insertObject();
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
    // stat = "background "+img_name+" activated";

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
  for (var p = 0; p<pixel.length; p+=4)
  {
    if (map[p/4] == 0) {
        pixel[p+3] = 0;
    }
  }
  
  // Draw the new image back to canvas
  ctx.imageSmoothingEnabled = true;
  ctx.putImageData(imageData, 0, 0);
  }
}

function insertObject(){
  let canvas3 = document.createElement('canvas');
  let ctx2 = canvas3.getContext('2d');
  var img = new Image;
  img.src = '../images/objects/apple.png';
  // document.appendChild(img);
  ctx2.drawImage(img,10,10);
}
