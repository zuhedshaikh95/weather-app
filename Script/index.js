let key = "d158bc2648206b34555f1dd651a1d016";
let container = select("#container");
let body = select("body");
let loader = select("#loader");
let error_box = select(".error");
let error_title = select(".error > h1");
let error_msg = select(".error > p");
let map = select("iframe");
let forecastMain = select("#forecastMain");


let form = select("form");
form.addEventListener("submit", getWeather);
let cityWeather=[];
 function getWeather(){
    event.preventDefault();
    loader.style.display="block";
    body.style.background="rgba(0,0,0,0.4)";
    error_box.style.display="none";
    container.style.display="none";
    forecastMain.style.display="none";

    getData("metric");
    async function getData(unit){
        try{
            let city = form.city.value;
            let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=${unit}`);
            let data = await res.json();          

            if(data.cod == 404){
                loader.style.display="none"
                container.style.display="none";
                error_box.style.display="block";
                forecastMain.style.display="none";
                error_title.innerText = data.cod;
                error_msg.innerText = data.message;
                body.style.background="";
            }
            else if(data.cod == 200){
                error_box.style.display="none";
                setTimeout(()=>{
                    loader.style.display="none";
                    container.style.display="flex";
                    forecastMain.style.display="block";
                    body.style.background="";
                    displayWeather(data);
                    forecast(data);
                    
                    map.src = `https://maps.google.com/maps?q=${city}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                },500);
            }
        }
        catch(error){
            console.log(error);
        }
    }
}


function displayWeather(data){

    let area = select("#area");
    area.innerText = data.name+",";

    let country = select("#country");
    country.innerText = data.sys.country;

    let ico = data["weather"][0].icon;
    let iconurl = `http://openweathermap.org/img/w/${ico}.png`;
    let icon = select("#wdicon");
    icon.src = iconurl;

    let temp = select("#temp");
    temp.innerText = Math.floor(data.main.temp)+"°C";

    let type;
    let speed = data.wind.speed;
    if(speed <= 0.5 ){
        type="Calm"
    }
    else if(speed > 0.5 && speed <= 1.5){
        type="Light Air";
    }
    else if(speed > 1.5 && speed <= 3.3){
        type="Light breeze";
    }
    else if(speed > 3.3 && speed <= 5.5){
        type="Gentle Breeze";
    }
    else if(speed > 5.5 && speed <= 7.9){
        type = "Moderate breeze";
    }
    else if(speed > 7.9 && speed <= 10.7){
        type = "Fresh breeze";
    }
    else if(speed > 10.7 && speed <= 13.8){
        type = "Strong breeze";
    }

    let bio = select("#bio");
    let feels_temp = Math.ceil(data.main.feels_like);
    let desc = data.weather[0].description;
    bio.innerText ="Feels like "+feels_temp+". "+desc+". "+type;

    let windspeed = select("#windspeed");
    let humidity = select("#humidity");
    let dewpoint = select("#dewpoint");
    let pressure = select("#pressure");
    let visibility = select("#visibility");
    
    windspeed.innerText ="Windspeed: "+ speed+"m/s";
    pressure.innerText ="Pressure: "+ data.main.pressure+"Pa";
    humidity.innerText ="Humidity: "+ data.main.humidity+"%";
    dewpoint.innerText ="Dew point: "+ Math.ceil(data.main.temp_max-1)+"°C";

    visibility.innerText ="Visibility: "+ Math.floor(data.visibility/1000).toFixed(1)+"km";

}

select("#metric").addEventListener("click",()=>{
    getData("metric")
});


function select(elem){
    return document.querySelector(elem);
}

function getLocation(){
    const coords = JSON.parse(localStorage.getItem("coords"));
    if(navigator.geolocation){
        if(!coords){
            navigator.geolocation.getCurrentPosition(showPosition);
            alert("Allow permission to get forcast of your area!!!")
        }
        const localData = JSON.parse(localStorage.getItem("local-area")) || {}
        
        if(localData){
            displayWeather(localData);
            forecast(localData);
        }
    }
    else{
        alert("Geolocation is not supported to this browser.")
    }

    function showPosition(position){
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        localStorage.setItem("coords", JSON.stringify({lat, lon}));
        
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`)
        .then((res)=>{
            return res.json();
        })
        .then((response)=>{
            localStorage.setItem("local-area", JSON.stringify(response));
            displayWeather(response);
            forecast(response)
        })
        .catch((error)=>{
            console.log(error);
        });
    }
}

let forecastCont = document.querySelector("#forecastCont");
async function forecast(data){
    let cnt = 7;
    let lat = data["coord"]["lat"];
    let lon = data["coord"]["lon"];
    let res2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=${cnt}&appid=${key}&units=metric`);

    let {list} = await res2.json();
    displayForecast(list);
    
}


function displayForecast(data){
    forecastCont.innerHTML="";
    data.forEach((elem,index)=>{
        let div = document.createElement("div");
        let max = document.createElement("h4");
        let min = document.createElement("h5");
        let img = document.createElement("img");

        max.innerText = Math.ceil(elem.main.temp_max)+"°C";
        min.innerText = Math.floor(elem.main.temp_min)+"°C";
        img.src = `http://openweathermap.org/img/w/${elem.weather[0].icon}.png`;

        div.append(img,max,min);
        forecastCont.append(div);

    });

    function convert(t){
        let date = new Date(t*1000);
        return date.toLocaleDateString();
    }
}