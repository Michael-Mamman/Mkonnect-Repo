/* Template Name: in-industry 
   Description: This is a in-industry and Agency HTML5 Template;
   Version: 1.0 
   Authot: Md. Mushahidul islam 
   Website: www.mumitheme.com/tf/industrius
    ersion: 1.0  
	NOTE:  This is js file contents all jQuery plugins.
*/
/*================================================
[  Table of contents  ]
================================================
  01. 01. Easyzoom Animation Active
	02. jQuery MeanMenu Active
	03. CounterUp Active
	04. Venobox Active
  05. ScrollUp
	06. Range Slider
	07. Accourdian Plus Minus icon
	08. Cart Plus Minus
	09. Range Slider
	10. Accordion active class
	11. Sticky Header
	12. Hero content
	13. Testimonial
  15. Related product
  16. Product Details 2 Images Slider
  17. Video
  18. Watch Model Slide
  19. AOS Animation
  20. Menu Move
	21. Preloader
======================================
[ End table content ]
======================================*/


(function ($) {
 "use strict";
  /* ==== 01. Easyzoom Animation Active ==== */
    var $easyzoom = $('.easyzoom').easyZoom();
    jQuery(document).ready(function($){

		/* ==== 02. jQuery MeanMenu Active ==== */
		if ($('.proone-nav').length) {
			jQuery('.proone-nav').meanmenu();	
		}
    /* ==== 03. CounterUp Active ==== */
      if ($('.counter').length) {
        $('.counter').counterUp({
          delay: 10,
          time: 2000
        });
      }
		/* ==== 04. Venobox Active ==== */	
		if ($('.venobox').length) {
			$('.venobox').venobox(); 
		}
			
		/* ==== 05. ScrollUp ==== */
		$.scrollUp({
			scrollText: '<i class="icofont-swoosh-up"></i>',
			easingType: 'linear',
			scrollSpeed: 900,
			animation: 'fade'
		}); 
	
    });
   /* ==== 06. Range Slider ==== */
    if($('.slider-product-sorting').length){
        $( function() {
            $( ".slider-product-sorting" ).slider({
            range: true,
            min: 0,
            max: 100,
            values: [ 2, 80 ],
            slide: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
            }
            });
            $( "#amount" ).val( "$" + $( ".slider-product-sorting" ).slider( "values", 0 ) +
            " - $" + $( ".slider-product-sorting" ).slider( "values", 1 ) );
        } );
    }
    /* ==== 07. Accourdian Plus Minus icon ==== */
        $(".collapse.show").each(function(){
            $(this).prev(".card-header").find(".my").addClass("icofont-minus").removeClass("icofont-plus");
        });
        // Toggle plus minus icon on show hide of collapse element
        $(".collapse").on('show.bs.collapse', function(){
            $(this).prev(".card-header").find(".my").removeClass("icofont-plus").addClass("icofont-minus");
        }).on('hide.bs.collapse', function(){
            $(this).prev(".card-header").find(".my").removeClass("icofont-minus").addClass("icofont-plus");
        });

  /* ==== 08. Cart Plus Minus ==== */
    var CartPlusMinus = $('.cart-plus-minus');
    CartPlusMinus.prepend('<div class="dec qtybutton">-</div>');
    CartPlusMinus.append('<div class="inc qtybutton">+</div>');
    $(".qtybutton").on("click", function() {
        var $button = $(this);
        var oldValue = $button.parent().find("input").val();
        if ($button.text() === "+") {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        $button.parent().find("input").val(newVal);
    });
  /* ==== 09. Range Slider ==== */
        if($('.slider-product-sorting').length){
            $( function() {
                $( ".slider-product-sorting" ).slider({
                range: true,
                min: 0,
                max: 100,
                values: [ 2, 80 ],
                slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                }
                });
                $( "#amount" ).val( "$" + $( ".slider-product-sorting" ).slider( "values", 0 ) +
                " - $" + $( ".slider-product-sorting" ).slider( "values", 1 ) );
            } );
        }
  
// === 10. Accordion active class ===
	$('.card').on('click', function(event) {
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
		event.preventDefault();
	});

// ==== 11. Sticky Header ====
    $(function() {
        var header = $("#header"),
            yOffset = 0,
            triggerPoint = 200;
        $(window).on( 'scroll', function() {
            yOffset = $(window).scrollTop();
            if (yOffset >= triggerPoint) {
            	header.removeClass("animated cssanimation");
                header.addClass("navbar-fixed-top sticky  cssanimation animated fadeInTop");
            } else {
                header.removeClass("navbar-fixed-top sticky cssanimation  animated fadeInTop");
                header.addClass("animated cssanimation");
            }

        });
    });
    // === 12. Hero content ===
     $('.hero-content-wrap-slide').slick({
        dots: false,
        autoplay: false,
        arrows:false,
        speed: 1500, 
        slidesToShow: 1,
    }); 
    // === 13. Testimonial ===
     $('.testimonial-wrap').slick({
        dots: true,
        autoplay: false,
        centerMode: false,
        swipe: true,
        arrows:false,
        speed: 1500, 
        slidesToShow: 3,
        slidesToScroll: 1,     
        responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 1050,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 479,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    }); 
    // === 14. Product Slider ===
     $('.product-slider-wrap').slick({
        dots: false,
        autoplay: false,
        arrows:false,
        speed: 1500, 
        slidesToShow: 3,
        slidesToScroll: 1,     
        responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 479,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    }); 
     // === 15. Related product ===
     $('.product-related-slide').slick({
        dots: false,
        autoplay: false,
        arrows:false,
        speed: 1500, 
        slidesToShow: 3,
        slidesToScroll: 1,     
        responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 479,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    }); 

     // === 16. Product Details 2 Images Slider ===
    $('.product-details-images-2').each(function(){
        var $this = $(this);
        var $thumb = $this.siblings('.product-details-thumbs-2');
        $this.slick({
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: false,
            autoplaySpeed: 5000,
            dots: false,
            infinite: true,
            centerMode: false,
            centerPadding: 0,
            asNavFor: $thumb,
        });
    });
    $('.product-details-thumbs-2').each(function(){
        var $this = $(this);
        var $details = $this.siblings('.product-details-images-2');
        $this.slick({
            arrows: true,
            slidesToShow: 4,
            slidesToScroll: 1,
            autoplay: false,
            autoplaySpeed: 5000,
            vertical:true,
            verticalSwiping:true,
            dots: false,
            infinite: true,
            focusOnSelect: true,
            centerMode: false,
            centerPadding: 0,
            prevArrow: false,
            nextArrow: false,
            asNavFor: $details,
            responsive: [
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 3,
              }
            },
            {
              breakpoint: 991,
              settings: {
                slidesToShow: 3,
              }
            },
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 4,
                vertical: false
              }
            },
            {
              breakpoint: 479,
              settings: {
                slidesToShow: 3,
                vertical: false
              }
            }
        ]
        });
    });
    // === 17. Video ===
     $('.video-slider-wrap').slick({
        dots: false,
        autoplay: false,
        arrows:true,
        speed: 1500, 
        slidesToShow: 5,
        slidesToScroll: 1,
        prevArrow: '<a class="slick-prev"><i class="icofont-arrow-left"></i></a>',
        nextArrow: '<a class="slick-next"><i class="icofont-arrow-right"></i></a>',     
        responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 5
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 4
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 479,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    }); 
     // === 18. Watch Model Slide ===
     $('.watch-model-slide').slick({
        dots: false,
        autoplay: false,
        arrows:false,
        speed: 1500, 
        slidesToShow: 3,
        slidesToScroll: 1,     
        responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 479,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    }); 
    // === 19. AOS Animation ===
    AOS.init({
        easing: 'ease-out-back',
        duration: 1000
    });
    // === 20. Menu Move ===
       $('.proone-nav > ul > li > a').click(function() {
            //Toggle Class
            $(".active").removeClass("active");
            $(this).closest('li').addClass("active");
            var theClass = $(this).attr("class");
            $('.' + theClass).parent('li').addClass('active');
            //Animate
            $('html, body').stop().animate({
                scrollTop: $($(this).attr('href')).offset().top - 100
            }, 1000);
            return false;
        });



	/* ==== 21. Preloader ==== */
	$(window).on('load',function(){
		jQuery(".preloader-wrap").fadeOut(500);
	});
   // === 15. Related product ===
   $('.post-thumbnail.gallery').slick({
      dots: false,
      autoplay: false,
      arrows:false,
      speed: 1500, 
      slidesToShow: 1,
      slidesToScroll: 1, 
  }); 

	
})(jQuery); 
