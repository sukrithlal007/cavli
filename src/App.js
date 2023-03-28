import './App.css';
import { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Loader } from 'react-loader-spinner';

function App() {
  const BASE_URL = 'http://localhost:5000/';

  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [failiure, setFailiure] = useState(false);
  const [failiureMessage, setFailiureMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);

  const [voltageData, setVoltageData] = useState([]);

  const [lineChartData, setLineChartData] = useState({});
  const [nextDatasets, setNextDatasets] = useState([]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };



  const handleUpload = () => {
    if (!selectedFile) {
      setSuccess(false);
      setFailiure(true);
      setFailiureMessage('File not selected');
      return;
    }

    if (selectedFile.type !== "application/json") {
      setSuccess(false);
      setFailiure(true);
      setFailiureMessage('File type not permitted,Upload JSON File');
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post(BASE_URL + 'jsonS3Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setIsLoading(false);
        setFailiure(false);
        setSuccess(true);
        setSuccessMessage(response.data.message);

        fetchData();
      })
      .catch(error => {
        setIsLoading(false);
        setSuccess(false);
        setFailiure(true);
        setFailiureMessage(error);
        console.error('Error:', error);
      });
  };



  useEffect(() => {
    fetchData();

  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedFile]);


  const fetchData = async () => {
    axios.get(BASE_URL + 'viewUploadedJSON')
      .then(response => {
        setFileData(response.data.items);
      })
      .catch(error => {
        setSuccess(false);
        setFailiure(true);
        setFailiureMessage(error);
        console.error(error);
      });
  };


  function showMaintenance() {
    setSuccess(true);
    setFailiure(true);
    setSuccessMessage('This feature is not availabale right now !');
  }

  /* function drawGraph(file) {
     axios.get(BASE_URL + 'viewUploadedJSON/1')
       .then(response => {
         const graphData = response.data.itemData.data;
 
         const voltageData = graphData.map(item => item.tid);
         setVoltageData(voltageData);
 
         const chartData = createLineChartData(graphData);
         setLineChartData((lineChartData) => ({ ...chartData }));
 
         console.log(lineChartData);
 
       })
       .catch(error => {
         console.error(error);
       });
 
   }
   //chart end
 
   function createLineChartData(data) {
     const chartData = {
       labels: [], // Array to store timestamps
       datasets: [], // Array to store dataset objects
     };
 
     // Loop through each data object and create a dataset for it
     data.forEach((item, index) => {
       // Create a unique color for each dataset
       const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
         Math.random() * 256
       )}, ${Math.floor(Math.random() * 256)}, 0.2)`;
 
       // Add the timestamps to the labels array
       chartData.labels = voltageData;
 
       // Create a new dataset object and push it to the datasets array
       chartData.datasets.push({
         label: item.tid,
         data: item.timestamps,
         borderColor: color,
         // backgroundColor: color,
         fill: false,
       });
     });
 
     console.log(chartData);
 
     return chartData;
   } */



  return (
    <div className='container'>

      {success && <div class="alert-success">
        {successMessage}
      </div>}

      {failiure && <div class="alert-failiure">
        {failiureMessage}
      </div>}


      <input type="file" onChange={handleFileSelect} />
      <input className='button-4' type="submit" onClick={handleUpload} value="Submit" />


      {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}




      <div>
        <h1>Uploaded Files</h1>
        {fileData && fileData.length > 0 ? (
          <ol >
            {fileData.map((file) => (
              <li key={file}>
                {file}
                <div>
                  <button className='button-3' onClick={showMaintenance}>View file</button>
                </div>
              </li>

            ))}
          </ol>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>

      {/*lineChartData && lineChartData.length > 0 ? (

        <div className='charts'>
          <Line data={lineChartData} />
        </div>
      ) : (
        <div className='nocharts'></div>
      )*/}
    </div>
  );
}

export default App;
