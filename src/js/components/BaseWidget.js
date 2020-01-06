class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.value = initialValue;

    }
    
    setValue(value){

        const thisWidget = this;
  
        const newValue = thisWidget.parseValue(value);
  
        /* TODO: Add validation */
  
        if(newValue !== thisWidget.value && thisWidget.isValid(newValue)){
  
          thisWidget.value = newValue;
          thisWidget.announce();
        }
  
        thisWidget.renderValue();
  
      }
}

export default BaseWidget;