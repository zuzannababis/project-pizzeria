import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm(); 
    thisProduct.initAmountWidget();
    thisProduct.processOrder();      

    //console.log('New Product:', thisProduct);
  }

  renderInMenu(){

    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */

    /*const clickedElement = thisProduct.element.querySelector(select.menuProduct.clickable);
    console.log('click', clickedElement);*/

    /* START: click event listener to trigger */   
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        //console.log('clicked');     

      /* prevent default action for event */         
      event.preventDefault();
        
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);        

      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      //console.log(activeProducts, 'activeProduct');

        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts){

          /* START: if the active product isn't the element of thisProduct */
          if(activeProduct !== thisProduct.element){

            /* remove class active for the active product */
            activeProduct.classList.remove('active');

          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }
      });
      /* END: click event listener to trigger */    
  }
  initOrderForm(){
    const thisProduct = this;

    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
    
  processOrder(){
    const thisProduct = this;

    //console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    thisProduct.params = {};

    let price = thisProduct.data.price;

    /* START LOOP: for each paramId in thisProduct.data.params */
    for(let paramId in thisProduct.data.params){

      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];

      /* START LOOP: for each optionId in param.options */
      for(let optionId in param.options){

        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /* START IF If the option is selected and the option is not default */
          if(optionSelected && !option.default){

            /* Add price of this option to the price */
            price += option.price;

          /* END IF If the option is selected and the option is not default */
          }

          /* START ELSE IF If the option is default and the option is not selected */
          else if(!optionSelected && option.default){

          /* Deduct the price of this option from the price */
          price -= option.price;
            
          /* END ELSE IF If the option is default and the option is not selected */
          }

          /* find all images for options */
          const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          /* START IF If the option is selected */
          if(optionSelected){

            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            /* START LOOP for each image */
            for(let image of images){

              /* add class active on each image */
              image.classList.add(classNames.menuProduct.imageVisible);

            /* END LOOP for each image */
            }

          /* END IF If the option is selected */
          }

          /* START ELSE If the option is not selected */
          else {

            /* START LOOP for each image */
            for(let image of images){

              /* remove calss active */
              image.classList.remove(classNames.menuProduct.imageVisible);

            /* END LOOP for each image */
            }
          /* END ELSE if the optin is not selected */
          }          
      }
      /* END LOOP: for each optionId in param.options */
    }
    /* END LOOP: for each paramId in thisProduct.data.params */
    /* multiply price by amount */
      
    // price *= thisProduct.amountWidget.value;

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* insert price value to thisProduct.priceElem */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log(thisProduct.params, 'product params');
  }

  initAmountWidget(){
    const thisProduct = this;
  
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;