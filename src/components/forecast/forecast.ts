import {HttpClient} from "aurelia-http-client";
import {BindingEngine, inject} from 'aurelia-framework';
import * as moment from 'moment';
import {default as config} from '../../config';
import {createUrl} from '../../utils';
import {bindable} from "aurelia-typed-observable-plugin";

@inject(BindingEngine, HttpClient)
export class Forecast {
  @bindable public cityName: string;
  private subscription: object;
  private forecastDays: any[] = this.getNextFiveDays();
  private forecastDaysCount = config.forecast.countOfDays;

  constructor(private bindingEngine: BindingEngine, private http: HttpClient) {
    this.forecastDays = this.getNextFiveDays();
    this.subscription = this.bindingEngine
      .propertyObserver(this, 'cityName')
      .subscribe((selectedCity) => {
        this.handleCityNameChanges(selectedCity)
      });
  }

  handleCityNameChanges(selectedCity) {
    this.fetchForecast(selectedCity)
  }

  getNextFiveDays() {
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

    this.http.get(url)
      .then(success => {
        let response = JSON.parse(success.response);

        for (var i = 0; i < this.forecastDaysCount; i++) {
          this.forecastDays[i].forecast = response.forecast.forecastday[i];
        }
      });
  }
}
