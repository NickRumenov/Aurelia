import {HttpClient} from "aurelia-http-client";
import {BindingEngine, inject} from 'aurelia-framework';
import {bindable} from "aurelia-typed-observable-plugin";
import * as moment from 'moment';
import {default as config} from '../../config';
import {createUrl} from '../../utils';

@inject(BindingEngine, HttpClient)
export class Forecast {
  @bindable cityName: string;
  private subscription;
  private forecastDays: any[] = [];
  private forecastDaysCount = config.forecast.countOfDays;

  constructor(private bindingEngine: BindingEngine, private http: HttpClient) {
    this.forecastDays = this.getNextDaysForForecast();
    this.subscription = this.bindingEngine
      .propertyObserver(this, 'cityName')
      .subscribe((selectedCity) => {
        this.handleCityNameChanges(selectedCity)
      });
  }

  detached(){
    this.subscription.dispose();
  }

  handleCityNameChanges(selectedCity) {
    this.fetchForecast(selectedCity).then(data =>{
      for (var i = 0; i < this.forecastDaysCount; i++) {
        this.forecastDays[i].forecast = data['forecast'].forecastday[i];
      }
    })
  }

  getNextDaysForForecast() {
    let days = [];
    for (var i = 0; i < this.forecastDaysCount; i++) {
      let day = moment().add(i, 'days');
      days.push(day);
    }
    return days;
  }

  fetchForecast(selectedCity) {
    let {apixuForecastUrlParams} = config;
    let url = createUrl(apixuForecastUrlParams, selectedCity);

    let promise = new Promise((resolve, reject) => {
        this.http.get(url)
        .then(success => {
          let response = JSON.parse(success.response);
          resolve(response);
        });
    });

    return promise;
  }
}
