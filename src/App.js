import { createRef, useState } from "react";
import AWSS3UploadAsh from 'aws-s3-upload-ash'
import logo from "./logo.svg";
import "./App.css";

function App() {
  let recorderRef = createRef();
  const [audioUrl, setAudioUrl] = useState("")
  const [audio] = useState(new Audio())
  const [blobAudio, setBlobAudio] = useState(null)

  const config = {
    bucketName: 'aws-s3-upload-ash',
    dirName: 'demo-audio', /* optional - when use: e.g BUCKET_ROOT/dirName/fileName.extesion */
    region: 'us-east-1',
    accessKeyId: process.env.REACT_APP_PUBLIC_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_PUBLIC_AWS_SECRET_KEY,
    s3Url: 'https://aws-s3-upload-ash.s3.amazonaws.com/'
  }
  const S3CustomClient = new AWSS3UploadAsh(config);

  async function startRecord() {
    console.log("START RECORD AUDIO");
    if (navigator?.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        recorderRef.current = new MediaRecorder(stream);

        recorderRef.current.addEventListener(
          "dataavailable",
          onRecordingFinish
        );

        recorderRef.current.start()
      } catch (error) {
        console.error("getUserMedia failed:", error.name);
      }
    }
  }

  function stopRecord(){
    recorderRef.current.stop()
  }

  async function onRecordingFinish (event) {
    console.log("RECORDING AUDIO COMPLETE")
    const audioChunks = [];
    audioChunks.push(event.data);
    const blob = new Blob(audioChunks, { type: "audio/mp3" });
    setBlobAudio(blob)
    const blob_stream = blob.stream()
    console.log('AUDIO blob', blob)
    console.log('AUDIO ReadableStream', blob_stream)

    const audioURL = URL.createObjectURL(blob);
    setAudioUrl(audioURL)
    console.log(audioURL)
    
    listenAudioRecorded()
  };

  async function listenAudioRecorded(){
    audio.src = audioUrl
    await audio.play()
  }

  async function sendAudioToAWSS3(){
    console.log('start upload audio')
    await S3CustomClient.uploadFile(blobAudio, blobAudio.type, undefined, "audio.mp3", "public-read")
    .then((data) => console.log('upload complete', data))
    .catch((err) => console.error('upload error:', err))
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Record audio and upload to AWS S3 with React.js</p>
        <button onClick={startRecord}>Start record</button>
        <br/>
        <button onClick={stopRecord}>Stop record</button>
        <br/>
        <button onClick={listenAudioRecorded}>Listen audio</button>
        <br/>
        <button onClick={sendAudioToAWSS3}>Send audio to AWS S3</button>
      </header>
    </div>
  );
}

export default App;
