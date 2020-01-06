import BaseWidget from './BaseWidget.js';
import {select, utils} from '../settings.js';

class DatePicker extends BaseWidget{

    constructor(wrapper){
        super(wrapper, utils.dateToStr(new Date()));

        const thisWidget = this;

        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

        thisWidget.initPlugin();
    }

}

export default DatePicker;