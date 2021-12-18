import React, {useEffect, useState} from 'react';
import zips from './zips';
import './index.css';
import axios from 'axios';
import _ from 'lodash';

export default function App(props){
  const [zip, setZip] = useState("");
  const [forecast, setForecast] = useState("");
  const [forecastUrl, setForecastUrl] = useState(null);

  const getWeatherForecast = () =>{
    if(!verifyZip()){
      setForecast('Do you think im an idiot?')
    }else{

      var zipRecord = zips.find( el => el.zip_code == zip);
      if(zipRecord == null){
        badData();
      }else{
        console.log(zipRecord);
        var lat = zipRecord.latitude;
        var long = zipRecord.longitude;
        if(lat == null || long == null){
          badData();
        }else{

          var forecastUrl = getZone(lat, long);
          if(forecastUrl == null){
            badData();

          }else{
            forecastUrl += '\forecast';
            console.log(forecastUrl);
            getForecast();
          }

        }
      }
    }
    

  }
  const verifyZip = () =>{
    let re = /^\d{5}(?:[-\s]\d{4})?/;

    if(zip.match(re)) return true;

    return false;
  }

  useEffect(() =>{
    console.log('forecastUrl');
    console.log(forecastUrl);
    const getForecast = () => {
      axios.get(`${forecastUrl + '/forecast'}`)
        .then((response) => {
          console.log('zone response');
          console.log(response);
          if(response && response.data && response.data.properties && response.data.properties.periods){
            var periods = response.data.properties.periods;
            console.log('periods');
            console.log(periods);
            if(periods[0] && periods[0].detailedForecast){
              setForecast(periods[0].detailedForecast);
            }else{
              
              badData();
            }
          }else{
            
            badData();
          }
        })
        .catch(error => {
          console.error(`Error: ${error}`)
          badData();
          return null;
        })
    }
    if(forecastUrl){
      getForecast();
    }
  },[forecastUrl])

  const getZone = (lat, long) => {
    axios.get(`https://api.weather.gov/zones?point=${lat}%2C${long}`)
      .then((response) => {
        console.log('zone response');
        console.log(response);
        if(response && response.data && response.data.features){
          var features = response.data.features;
          console.log(features)

          var forecastFeature = features.find(el => el.id.includes('forecast'));
          console.log(forecastFeature)

          console.log('setting forecast url' + forecastFeature.id + ' from ' + _.cloneDeep(forecastUrl));
          setForecastUrl(forecastFeature.id);
        }else{
          badData();
        }
      })
      .catch(error => {
        console.error(`Error: ${error}`)
        badData();
      })
  }

  const badData = () =>{
    setForecastUrl(null)
    setForecast("That zipcode simply wont work.");
  }

  const getForecast = (url) => {
    axios.get(`${url}`)
      .then((response) => {
        console.log('zone response');
        console.log(response);
      })
      .catch(error => {
        console.error(`Error: ${error}`)
        badData();
        return null;
      })
  }

  return(
    <div className="site-contents">
      <h1 className="site-header">
        Weather.com fucking sucks
      </h1>
      <div>
        Just give me your fucking zip code and ill tell you what the weather is gonna be.
      </div>
      <div className="zip-input">
        <input value={zip} onChange={(e) => {setZip(e.target.value)}} />
        <button onClick={getWeatherForecast}>give me forecast</button>
      </div>
      <div className="forecast">
        {forecast != "" &&
         (
          <>
          {forecast}
          </>
         )
        }
      </div>
    </div>
  )
}