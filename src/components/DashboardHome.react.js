import React, { Component } from 'react';

//  The components
import DateTimeDisplay from './DateTimeDisplay.react';
import WeatherDisplay from './WeatherDisplay.react';
import CalendarDisplay from './CalendarDisplay.react';
import NewsDisplay from './NewsDisplay.react';
import QuakeDisplay from './QuakeDisplay';

//  The API utils
import WeatherAPIUtils from '../utils/WeatherAPIUtils';
import CalendarAPIUtils from '../utils/CalendarAPIUtils';
import NewsAPIUtils from '../utils/NewsAPIUtils';
import QuakeAPIUtils from '../utils/QuakeAPIUtils';

//  The stores
import WeatherStore from '../stores/WeatherStore';
import CalendarStore from '../stores/CalendarStore';
import NewsStore from '../stores/NewsStore';
import SettingsStore from '../stores/SettingsStore';
import LocationInfoStore from '../stores/LocationInfoStore';
import QuakeInfoStore from '../stores/QuakeStore';

class DashboardHome extends Component {

    constructor(props) {
        super(props);

        this.state = {
            weather: WeatherStore.getWeather(),
            weatherupdated: WeatherStore.getLastUpdateTime(),
            pollen: WeatherStore.getPollen(),
            calendarinfo: CalendarStore.getCalendarData(),
            calendarupdated: CalendarStore.getLastUpdateTime(),
            news: NewsStore.getBreakingNews(),
            settings: SettingsStore.getSettings(),
            cal_authcheckfinished: CalendarStore.authCheckFinished(),
            cal_authorized: CalendarStore.areAuthorized(),
            location_name: LocationInfoStore.getLocationName(),
            quakes: QuakeInfoStore.getQuakeInfo()
        };

        //  Bind our event handlers:
        this._onChange = this._onChange.bind(this);
        this.tick = this.tick.bind(this);
    }

    tick() {
        //  Get the latest weather:
        switch (this.state.settings.weathersource) {
            case "Yahoo":
                WeatherAPIUtils.getCurrentYahooWeather(this.props.coords.latitude, this.props.coords.longitude);
                break;
            case "Forecastio":
                WeatherAPIUtils.getCurrentForecastIOWeather(this.props.coords.latitude, this.props.coords.longitude);
                break;
            default:
                /* No-op */
                break;
        }

        //  Get the latest pollen
        WeatherAPIUtils.getPollen(this.state.settings.zipcode);

        //  Get the latest calendar information if the API is loaded, 
        //  we're authorized, and we have a calendar selected:
        if (this.state.cal_authcheckfinished && this.state.cal_authorized && this.state.settings.calendarid !== "") {
            CalendarAPIUtils.getCalendarEvents(this.state.settings.calendarid);
        }

        //  Get the latest breaking news:
        NewsAPIUtils.getTwitterFeed(this.state.settings.newsuser);

        //  Get quake information:
        QuakeAPIUtils.getQuakeList();
    }

    componentDidMount() {
        //  Add an interval tick for every 5 minutes:
        this.interval = setInterval(this.tick, 300000);

        //  Add store listeners ... and notify ME of changes
        this.weatherListener = WeatherStore.addListener(this._onChange);
        this.calendarListener = CalendarStore.addListener(this._onChange);
        this.newsListener = NewsStore.addListener(this._onChange);
        this.locationListener = LocationInfoStore.addListener(this._onChange);
        this.quakeListener = QuakeInfoStore.addListener(this._onChange);
    }

    componentWillUnmount() {
        //  Clear the interval:
        clearInterval(this.interval);

        //  Remove store listeners
        this.weatherListener.remove();
        this.calendarListener.remove();
        this.newsListener.remove();
        this.locationListener.remove();
        this.quakeListener.remove();
    }

    render() {

        return (
            <div>
                <div className="container-fluid">
                    <div className="row">

                        <div className="col">
                            <WeatherDisplay weather={this.state.weather} updated={this.state.weatherupdated} pollen={this.state.pollen} locationname={this.state.location_name} />
                            <QuakeDisplay quakes={this.state.quakes} />
                        </div>

                        <div className="col">
                            <DateTimeDisplay />
                            <CalendarDisplay calendar={this.state.calendarinfo} updated={this.state.calendarupdated} />
                        </div>

                    </div>                    
                </div>
                <NewsDisplay news={this.state.news} />
            </div>            
        );
    }

    _onChange() {
        this.setState({
            weather: WeatherStore.getWeather(),
            pollen: WeatherStore.getPollen(),
            calendarinfo: CalendarStore.getCalendarData(),
            news: NewsStore.getBreakingNews(),
            settings: SettingsStore.getSettings(),
            cal_authcheckfinished: CalendarStore.authCheckFinished(),
            cal_authorized: CalendarStore.areAuthorized(),
            location_name: LocationInfoStore.getLocationName(),
            quakes: QuakeInfoStore.getQuakeInfo()
        });
    }

}

export default DashboardHome;