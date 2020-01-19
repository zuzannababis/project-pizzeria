// eslint-disable-next-line no-unused-vars
/*import {select, classNames, settings, templates} from '../settings.js';
import {utils} from '../utils.js';

class Home {
  constructor(id, data){
    const thisHome = this;

    thisHome.id = id;
    thisHome.data = data;

    thisHome.renderHomePage();
    thisHome.getElements();

    setInterval(function(){
        thisHome.showSlides();
      }, thisHome.time);

  }

  getElements(){
      const thisHome = this;

      thisHome.slides = thisHome.element.querySelector(select.containerOf.slideshow).children;
      thisHome.dots = thisHome.element.querySelector(select.containerOf.dots).children;
      thisHome.innerSlide = document.querySelectorAll('.slide');

      thisHome.currentSlide = 0;

      thisHome.time = settings.slideshowTime.time;

  }

  showSlides(){
      const thisHome = this;

      thisHome.currentSlide++;
        if(thisHome.currentSlide === thisHome.innerSlide.length){
      thisHome.currentSlide = 0;
      }   

      for(let slide of thisHome.slides){
        slide.classList.remove(classNames.slideshow.slides);
      }

      for(let dot of thisHome.dots){
        dot.classList.remove(classNames.slideshow.dots);
      }
  
      thisHome.slides[thisHome.currentSlide].classList.add(classNames.slideshow.slides);  
      thisHome.dots[thisHome.currentSlide].classList.add(classNames.slideshow.dot);

      
  }
renderHomePage(){
        const thisHome = this;
    
        const generatedHTML = templates.homePage(thisHome.data);
        // console.log('generated HTML:', generatedHTML);
    
        thisHome.element = utils.createDOMFromHTML(generatedHTML);
    
        const mainContainer = document.querySelector(select.containerOf.home);
    
        mainContainer.appendChild(thisHome.element);
}


      /*var currentSlide = 0;

      var i;

      for (let slide of thisHome.slides){

      for (i = 0; i < slide.length; i++) {
      slide[i].style.display = "none";

      currentSlide++;
      if (currentSlide > slide.length) {currentSlide = 1}
      slide[currentSlide-1].style.display = "block";
      setTimeout(thisHome.showSlides, 3000);
    }
    }*/



}

export default Home; 