(function() {
  'use strict';

  var section = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  /*var section = document.querySelectorAll(".section");*/
  var sections = {};
  var i = 0;
      var window_height_half = 0.0;

    // Recompute window sizes
    window.onresize = function() {
	      window_height_half = 0.5*window.innerHeight;
    }

    // Read and store positions of sections from top
    function readsectionpositions() {
	      window_height_half = 0.5*window.innerHeight;
        section = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
	      Array.prototype.forEach.call(section, function(e) {
	          if(e.parentElement.id !== "table-of-contents" && e.parentElement.nodeName !== "HEADER" && e.parentElement.id != "header" && e.parentElement.id != "sigfile" && e.parentElement.id != "footnotes" && e.className != "title") {
		            sections[e.id] = e.offsetTop;
	          }
        });
        // Set the first encountered section as "active"
        for (i in sections) {
	          if(document.querySelector("a[href*='" + i + "']") !== null) {
	              document.querySelector("a[href*='" + i + "']").parentElement.setAttribute('class', 'active'); break;
	          }
        }
    }

    window.onload = function() {
        readsectionpositions();

        // Note all footnote references
        var footrefs = document.getElementsByClassName("footref");
        var footdefs = document.getElementsByClassName("footdef");
        var footnote = document.getElementById("footnotes");
        var text_footnote = document.getElementById("text-footnotes");
        var k, scr = 0, mysel;
        // Give the footnotes tab hover behavior
        if(footnote != null) {
            footnote.addEventListener("mouseover", function() {
                if (text_footnote.style.display == "block") {
                    scr = footnote.scrollTop;
                } else {
                    text_footnote.style.display = "block";
                    footnote.scrollTop = scr;
                }
            });
            text_footnote.addEventListener("mouseout", function() {
                scr = footnote.scrollTop;
                text_footnote.style.display = "none";
                mysel = document.querySelector(".highlighted");
                if(mysel != null) {
                    mysel.classList.remove("highlighted");
                }
                mysel = document.querySelector(".just_clicked");
                if(mysel != null) {
                    mysel.classList.remove("just_clicked");
                }

            });
        // Toggle footnotes tab visibility when footnote link is clicked
        // Clicking any footnote reference twice consecutively collapses tab
            var j, l;
            for (j = 0; j < footrefs.length; j++) {
                footrefs[j].addEventListener("click", function() {

                    if (this.classList.contains("just_clicked")) {
                        this.classList.remove("just_clicked");
                        scr = footnote.scrollTop;
                        text_footnote.style.display = "none";
                    } else {
                        mysel = document.querySelector(".just_clicked");
                        if (mysel != null) {
                            mysel.classList.remove("just_clicked");
                        }
                        this.classList.add("just_clicked");
                        text_footnote.style.display = "block";
                        setTimeout(function() {
                            footnote.scrollTop = Math.max(0, footnote.scrollTop - 11);
                        }, (10)); // miliseconds
                    }
                });

                footrefs[j].addEventListener("mouseover", function() {
                    l = this.id.split(".")[1]-1;
                    footdefs[l].classList.add("highlighted");
                });

                footrefs[j].addEventListener("mouseout", function() {
                    l = this.id.split(".")[1]-1;
                    if (footdefs[l].classList.contains("highlighted")) {
                        footdefs[l].classList.remove("highlighted");
                    }
                });

            }
        }
        // Handle visibility of treeview segments
	      var treetoggler = document.getElementsByClassName("caret");
	      var i;
	      for (i = 0; i < treetoggler.length; i++) {
	          treetoggler[i].addEventListener("click", function(tt) {
		            this.parentElement.querySelector(".nested").classList.toggle("active");

                var activelist = this.parentElement.querySelector(".active");
                if(activelist != null) {
                    activelist.addEventListener("click", function(e) {
                        if(  e.offsetX < 5) {
                            e.target.classList.remove("active");
                            e.target.parentElement.querySelector(".caret").classList.remove("caret-down");
                            readsectionpositions();
                            updatetoc_sectionhighlighting();
                        }
                    });
                }
		            this.classList.toggle("caret-down");
                readsectionpositions();
                updatetoc_sectionhighlighting();
	          });

	      }
    }


    // Update highlighted section in table of contents
    function updatetoc_sectionhighlighting() {
      var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      for (i in sections) {
	        if (sections[i] <= scrollPosition + window_height_half) {
              document.querySelector('.active').setAttribute('class', ' ');
	            if(document.querySelector("a[href*='" + i + "']") !== null) {
                  document.querySelector("a[href*='" + i + "']").parentElement.setAttribute('class', 'active');
	            }
	        }
      }
  };

    window.onscroll = function() {
        updatetoc_sectionhighlighting();
    };

})();
