//for webrtc
let mediaRecorder, recordedBlobs;
let gumVideo = document.querySelector('video#gum');

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo   = document.querySelector('video#recorded');
const recordButton    = document.querySelector('button#record');
const playButton      = document.querySelector('button#play');
const downloadButton  = document.querySelector('button#download');
const snapButton      = document.querySelector('button#ss');
document.querySelector('button#start').addEventListener('click', async () => {
    const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
    const constraints = {
      audio: {
        echoCancellation: {exact: hasEchoCancellation}
      },
      video: {
        width: 1000, height: 500
      }
    };
    console.log('Using media constraints:', constraints);
    await init(constraints);
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
    recordButton.disabled = false;
    snapButton.disabled = false;

    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;
   
    // const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;
  }
 
  recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Record') {
      startRecording();
    } else {
      stopRecording();
      recordButton.textContent = 'Record';
      playButton.disabled = false;
      downloadButton.disabled = false;
    }
  });

  snapButton.addEventListener('click', () =>{
      takeSnapshot()
      .then(download);
  })

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
    recordButton.textContent = 'Stop Recording';
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

  function takeSnapshot(){
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = gumVideo.videoWidth;
    canvas.height =gumVideo.videoHeight;

    ctx.drawImage(gumVideo,0,0);

    return new Promise((res,rej) =>{
    canvas.toBlob(res,"image/jpeg");
    })

  }

  function download(blob){
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "Screenshot.jpg";
    document.body.appendChild(a);
    a.click;
  }

  function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

  function stopRecording() {
    mediaRecorder.stop();
  }
  

playButton.addEventListener('click', () => {
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();
  });

  downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  });

//for speech recognition
  var speechRecognition = window.webkitSpeechRecognition;
  var recognition = new speechRecognition();
  var textbox = $("#textbox");
  var instruction = $("#instruct");
  var content = "";

  recognition.continuos = true;

  recognition.onstart = function () {
    instruction.text("Voice Recognition is on");
  }

  recognition.onspeechend = function (){
    instruction.text("No Activity");
  }

  recognition.onerror = function (){
    instruction.text("Try Again");
  }

  recognition.onresult = function (event){
    var current = event.resultIndex;

    var transcript = event.results[current][0].transcript;

    content += transcript;

    textbox.val(content);
  }

  $("#start-btn").click(function(event){
      if(content.length) {
        content += '';

      }
      recognition.start();
  })

  textbox.on('input', function(){
    content = $(this).val();
  });