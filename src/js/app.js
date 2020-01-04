/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

 
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
      
      

      console.log('New Product:', thisProduct);
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
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget{

    constructor(element){

      const thisWidget = this;

      thisWidget.getElements(element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.setValue(thisWidget.input.value);

      thisWidget.initActions();

      //console.log('AmountWidget', thisWidget);
      //console.log('contructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }

    setValue(value){

      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      if(newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){

        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;

    }

    initActions(){

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });   
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

        for(let key of thisCart.renderTotalsKeys){
          thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
        }
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: thisCart.dom.address,
        totalPrice: thisCart.totalPrice,
        phone: thisCart.dom.phone,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for (let product of thisCart.products){
        payload.products.push(product.getData());
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
        });
    }

    add(menuProduct){
      const thisCart = this;

      //console.log('adding product', menuProduct);

      /* generate HTML based on template */

      const generatedHTML = templates.cartProduct(menuProduct);

      /* create generatedDOM using utils.createElementFromHTML */

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* add DOM elements to thisCart.dom.productList */

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      console.log(thisCart.totalNumber, 'total number');
      console.log(thisCart.subtotalPrice, 'subtotal');
      console.log(thisCart.totalPrice, 'total price');

      for(let key of thisCart.renderTotalsKeys){
        for (let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }

    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
  } 
    
  // eslint-disable-next-line no-unused-vars
  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();


      //console.log(thisCartProduct, 'new CartProduct');
      //console.log('productData', menuProduct);

    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
  
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
  
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      const orderedProduct = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
      console.log(orderedProduct, 'ordered product');     
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        //new Product(productData, thisApp.data.products[productData]);
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log(parsedResponse, 'parsedResponse');

          /*save parsedResponse as thisApp.data.products */

          thisApp.data.products = parsedResponse;

          /* execute initMenu method */

          thisApp.initMenu();

        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;

      const cartElem= document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
