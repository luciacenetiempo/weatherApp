if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pushCurrentLocation,locationError);
} else { 
    pushCurrentLocation('');
}
console.log()
document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';

function locationError(error){
    pushCurrentLocation('');
};
function pushCurrentLocation(position){
    var locations = [
        {
            city : 'Milan',
            lat : 45.4627124,
            long : 9.1076928,
            image : 'assets/img/milano.jpg'
        },
        {
            city : 'Bologna',
            lat : 44.4990968,
            long : 11.261646,
            image : 'assets/img/bologna.jpg'
        },
        {
            city : 'Rome',
            lat : 41.909986,
            long : 12.3959154,
            image : 'assets/img/roma.jpg'
        },
        {
            city : 'Naples',
            lat : 40.853586,
            long : 14.1729673,
            image : 'assets/img/napoli.jpg'
        },
        {
            city : 'Florence',
            lat : 43.7799528,
            long : 11.2059486,
            image : 'assets/img/firenze.jpg'
        }
    ];
    if(position){
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        var locationUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+long+'&localityLanguage=en';
        fetch(locationUrl).then(
            function(res){
                res.json().then(
                    function(data){
                        var currentLocation = [
                            {
                                city : data.locality,
                                lat : lat,
                                long : long,
                                image : 'assets/img/default.jpg'
                            }
                        ]
                        var newLocationsList = currentLocation.concat(locations);
                        setMeteoCard(newLocationsList);
                    }
                )
            }

        ).catch(function() {
            var newLocationsList = locations;
            setMeteoCard(newLocationsList);
        });
    } else {
        setMeteoCard(locations);
    }
}

function setMeteoCard(locations){
    var i,
    results = [],
    deferred,
    deferreds = [];
    for (i=0; i < locations.length; ++i){
        var lat = locations[i].lat;
        var long = locations[i].long;
        var api = 'b7bfa28e46b6b95c0c30dcf2cc467491';
        let card = [
            {
                id : i,
                name : locations[i].city,
                image : locations[i].image,
                weather : {}
            }
        ]
        deferred = $.ajax({
            url: 'https://api.darksky.net/forecast/'+api+'/'+lat+','+long+'?units=si',
            type: "GET",
            dataType: "jsonp",
            success: function(weatherData) {
                var today = {
                    icon: weatherData.daily.data[0].icon,
                    summary: weatherData.currently.summary,
                    extendedSummary: weatherData.daily.data[0].summary,
                    temp: Math.round(weatherData.currently.temperature),
                    tempMin: Math.round(weatherData.daily.data[0].temperatureMin),
                    tempMax: Math.round(weatherData.daily.data[0].temperatureMax)
                }
                var week = new Array();
                for (i=1; i<7; i++) {
                    var icon;
                    switch (weatherData.daily.data[i].icon) {
                        case 'clear-day':
                            icon = 'la-sun';
                            break;
                        case 'clear-night':
                            icon = 'la-moon';
                            break;
                        case 'rain':
                            icon = 'la-cloud-rain';
                            break;
                        case 'snow':
                            icon = 'la-snowflake';
                            break;
                        case 'sleet':
                            icon = 'la-wind';
                            break;
                        case 'wind':
                            icon = 'la-wind';
                            break;
                        case 'fog':
                            icon = 'la-smog';
                            break;
                        case 'cloudy':
                            icon = 'la-cloud';
                            break;
                        case 'partlyCloudy':
                            icon = 'la-cloud-sun';
                            break;
                        default:
                            icon = 'la-sun';
                    }
                    var weekDay = {
                        name: secondsToDay(weatherData.daily.data[i].time),
                        icon: icon,
                        tempMin: Math.round(weatherData.daily.data[i].temperatureMin),
                        tempMax: Math.round(weatherData.daily.data[i].temperatureMax),
                        date: secondsToFullDate(weatherData.daily.data[i].time),
                        summary: weatherData.daily.data[i].summary,
                        sunriseTime: secondsToHours(weatherData.daily.data[i].sunriseTime),
                        sunsetTime: secondsToHours(weatherData.daily.data[i].sunsetTime),
                    }
                    week.push(weekDay);
                }
                var weatherData = {
                    today : today,
                    week : week
                }
                var weather = card[0].weather = weatherData;
                results[card[0].id] = card[0];
            }
        });
        deferreds.push(deferred);
    };
    $.when.apply($, deferreds).then(function() {
        createCarousel(results);
    });
}
function secondsToDay(seconds) {
    seconds *= 1000;
    var weekDay = new Date(seconds);
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var day = days[weekDay.getDay()];
    return day;
}
function secondsToFullDate(seconds) {
    seconds *= 1000;
    var date = new Date(seconds);
    var day = date.getUTCDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var fullDate = day + ', ' + months[date.getMonth()] + ' ' + year;
    return fullDate;
}
function secondsToHours(seconds) {
    seconds *= 1000;
    var date = new Date(seconds);
    var time = date.getHours() + ":" + date.getMinutes();
    return time;
}
function createCarousel(results){
    var swiper = new Swiper('.swiper-container', {
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1,
        observer: true,
        observeParents: true,
        updateOnWindowResize: true,
        keyboard: {
            enabled: true,
        },
        pagination: { el: '.swiper-pagination', clickable: true },
        virtual: {
            slides: (
                function () {
                    slides = []
                    for (var i = 0; i < results.length; i += 1) {
                        var templateCard = `
                        <div class="swiper-slide weatherApp__card" style="background-image:url(${results[i].image})" data-lat="45.4627124" data-long="9.1076928" data-city="Milano">
                            <div class="weatherApp__card__content">
                                <div class="weatherApp__card__content__row">
                                    <div class="today">
                                        <h1>${results[i].name}</h1>
                                        <span class="today__condition">${results[i].weather.today.summary}</span>
                                        <span class="today__temp">${results[i].weather.today.temp}<sup>°</sup></span>
                                        <span class="today__minmax">${results[i].weather.today.tempMin}<sup>°</sup>/${results[i].weather.today.tempMax}<sup>°</sup></span>
                                        <span class="today__extended">${results[i].weather.today.extendedSummary}</span>
                                    </div>
                                </div>
                                <div class="weatherApp__card__content__row">
                                    <div class="week">
                                    ${results[i].weather.week.map((i) => {
                                        var tempDay = `
                                            <div class="week__day">
                                                <span class="week__day__name">${i.name}</span>
                                                <span class="week__day__condition">
                                                    <i class="las ${i.icon}"></i>
                                                </span>
                                                <span class="week__day__minmax">${i.tempMin}<sup>°</sup>/${i.tempMax}<sup>°</sup></span>
                                                <div class="details">
                                                    <div class="details__col">
                                                        <span class="details__icon">
                                                            <i class="las ${i.icon}"></i>
                                                        </span>
                                                    </div>
                                                    <div class="details__col">
                                                        <span class="details__date">${i.date}</span>
                                                        <div class="details__col__row">
                                                            <h2>${i.name}</h2>
                                                            <span class="details__minmax">&nbsp;-&nbsp;${i.tempMin}<sup>°</sup>/${i.tempMax}<sup>°</sup></span>
                                                        </div>
                                                        <span class="details__summary">${i.summary}</span>
                                                        <div class="details__timing">
                                                            <div class="details__timing--col">
                                                                <i class="las la-sun"></i>
                                                                ${i.sunriseTime}
                                                            </div>
                                                            <div class="details__timing--col">
                                                                <i class="las la-moon"></i>
                                                                ${i.sunsetTime}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            `;
                                            return tempDay;  
                                        }).join(' ')
                                    }
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                        slides.push(templateCard);
                    }
                    return slides;
                }()
            ),
        },
        on: {
            init: function () {
                var waveWidth = window.innerWidth * results.length;
                var main =  document.getElementById('weatherApp');
                document.getElementById('wave').style.width = waveWidth+'px';
                animateWaves();
                dayShow(this.activeIndex);
                showDetails();
                setTimeout(function(){ 
                    document.getElementById('weatherApp').classList.toggle('weatherApp__visible');
                    document.getElementById('loader').remove();
                }, 300);

            },
            setTranslate(translate) {
                console.log('setTranslate')
                document.getElementById('wave').style.transform = 'translate3d('+translate+'px, 0, 0)';
            },
            slideChangeTransitionEnd(){
                showDetails();
                dayShow(this.activeIndex);
            }
        },
    });
    window.addEventListener('resize', function(){
        document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';
        swiper.update();
    });
}

//ANIMATIONS
function dayShow(i){
    var tlContents = new TimelineLite(); 
    var tlDays = new TimelineLite(); 
    var days = document.querySelectorAll('.swiper-slide[data-swiper-slide-index="'+i+'"] .week__day');
    tlContents.to('.swiper-slide[data-swiper-slide-index="'+i+'"] .today', 0.9, {opacity:1});
    tlDays.staggerTo(days, 1, {opacity:1}, 0.30);
}
function animateWaves(){
    var tlWaves = new TimelineLite();
    var tlWaves2 = new TimelineLite();
    var waves = document.querySelectorAll('.weatherApp__wave');
    TweenLite.set(waves, {scaleX:2, scaleY:0.7, transformOrigin:"center bottom"} );
    tlWaves.to('.weatherApp__wave--one', 100,{x:'-50%',repeat:-1, yoyo:true} )
    tlWaves2.to('.weatherApp__wave--two', 100,{x:'50%',repeat:-1, yoyo:true} )
}
function showDetails(){
    var day = document.querySelectorAll('.week__day');
    var popup = document.getElementById('details');
    for (var i = 0; i < day.length; i += 1) {
        day[i].addEventListener('click', function(event) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].className == 'details') {
                  var details = this.childNodes[i].cloneNode(true);
                }        
            }
            popup.innerHTML = "";
            popup.style.display = 'none';
            popup.appendChild(details);
            popup.style.display = 'flex';
            closePopup();
        }, false);
    }
    var closePopup = function(){
        popup.addEventListener('click', function(event) {
            popup.innerHTML = "";
            popup.style.display = 'none';
        });
    }
}