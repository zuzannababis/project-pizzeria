import {select, templates, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {utils} from '../utils.js';


class Booking {

  constructor(bookingWidget){
    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.bookTable();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {

      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls); 

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])       
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          //console.log(bookings);
          //console.log(eventsCurrent);
          //console.log(eventsRepeat);
          thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }           
    }

    console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {}; 
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
       //console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = []; 
      }
    
      thisBooking.booked[date][hourBlock].push(table);
    }       
  } 

  bookTable(){
    const thisBooking = this;

    thisBooking.bookedTables = [];

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        if (table.classList.contains(classNames.booking.tableBooked)){
          return window.alert('this table is booked');
        } else {
          table.classList.add(classNames.booking.tableBooked);
          thisBooking.clickedElement = event.target;
          thisBooking.bookedTable = thisBooking.clickedElement.getAttribute(settings.booking.tableIdAttribute);
          thisBooking.bookedTables.push(thisBooking.bookedTable);
        }
      });
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
      peopleAmount: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
      starters: [],
      table: parseInt(thisBooking.bookedTable),
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
    };


    for (let starter of thisBooking.dom.starters){

      if (starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();          
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour , payload.table , payload.duration);
      
      });
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
            
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(bookingWidget){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingWidget;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.submit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

}

export default Booking;