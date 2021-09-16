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

    // create tooltip element
    var ttBox = document.createElement("div");

    // set style
    ttBox.id = "treetip";
    ttBox.innerHTML = "test text";

    window.onload = function() {

        // insert into DOM
        document.body.appendChild(ttBox);

        readsectionpositions();

        // Note all footnote references
        var footrefs = document.getElementsByClassName("footref");
        var footdefs = document.getElementsByClassName("footdef");
        var footnums = document.getElementsByClassName("footnum");
        var footnote = document.getElementById("footnotes");
        var text_footnote = document.getElementById("text-footnotes");
        var k, scr = 0, mysel;
        var isresizing = false;
        // Give the footnotes tab hover behavior
        if(footnote != null) {
            footnote.addEventListener("mouseover", (evt) => {
                if (text_footnote.style.display == "block") {
                    scr = footnote.scrollTop;
                } else {
                    text_footnote.style.display = "block";
                    footnote.scrollTop = scr;
                    var rect = footnote.getBoundingClientRect();
                    if (rect.top - evt.clientY > -20) {
                        footnote.style.cursor = "n-resize";
                    } else {
                        footnote.style.cursor = "default";
                    }
                }
            });
            text_footnote.addEventListener("mousemove", (evt) => {
                footnote.style.cursor = "default";
                var rect = footnote.getBoundingClientRect();
                if (rect.top - evt.clientY > -20) {
                    footnote.style.cursor = "n-resize";
                } else {
                    if (!isresizing) {
                        footnote.style.cursor = "default";
                    }
                }
            });
            document.addEventListener("mousemove", (evt) => {
                if (isresizing) {
                    footnote.style.cursor = "n-resize";
                    footnote.style.maxHeight = window.screen.height - evt.clientY + 'px';
                    footnote.scrollTop = scr;
                    console.log(window.screen.height - evt.clientY);
                }
            });

            footnote.addEventListener("mouseout", function() {
                if(! footnote.classList.contains("pinned")) {
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
                }
            });
            footnote.addEventListener("mousedown", (evt) => {
                if (footnote.style.cursor == "n-resize") {
                    isresizing = true;
                    scr = footnote.scrollTop;
                }
            });
            footnote.addEventListener("mouseup", (evt) => {
                isresizing = false;
            });
            text_footnote.addEventListener("mousedown", (evt) => {
                if (footnote.style.cursor != "n-resize") {
                    if (evt.target.tagName != "A") {
                        if(! footnote.classList.contains("pinned")) {
                            footnote.classList.add("pinned");
                            footnote.style.background = "#3b3b3b";
                            footnote.style.borderTopStyle = "groove";
                        } else {
                            footnote.classList.remove("pinned");
                            footnote.style.background = "#2b2b2b";
                            footnote.style.borderTopStyle = "none";
                            /*
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
                            */
                        }
                    }
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
        var ttarray = [];
	      var i;
	      for (i = 0; i < treetoggler.length; i++) {
            ttarray.push(treetoggler[i].innerHTML);

	          treetoggler[i].addEventListener("click", function(tt) {
		            this.parentElement.querySelector(".nested").classList.toggle("active");
                var activelist = this.parentElement.querySelector(".active");
                if(activelist != null) {
                    activelist.addEventListener("mousemove", function(e) {
                        var ii = Array.prototype.indexOf.call(treetoggler,this.previousSibling.previousSibling);
                        if(e.clientX < activelist.getBoundingClientRect().left + 20) {
                            ttBox.style.visibility = "visible";
                            ttBox.innerHTML = ttarray[ii];
                            ttBox.style.top = (e.clientY).toString() + "px";
                            ttBox.style.left = "100px";
                        } else {
                            ttBox.style.visibility = "hidden";
                        }
                        e.stopImmediatePropagation();
                    });
                    activelist.addEventListener("mouseout", function(e) {
                        var ii = Array.prototype.indexOf.call(treetoggler,this.previousSibling.previousSibling);
                        ttBox.style.visibility = "hidden";
                        e.stopImmediatePropagation();
                    });
                    activelist.addEventListener("click", function(e) {
                        if(e.offsetX <  activelist.getBoundingClientRect().left + 10) {
                            e.target.classList.remove("active");
                            if(e.target.parentElement.querySelector(".caret") != null) {
                                e.target.parentElement.querySelector(".caret").classList.remove("caret-down");
                            }
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
