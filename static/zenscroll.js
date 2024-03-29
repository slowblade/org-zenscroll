(function() {
  'use strict';

    var section = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    var iframes = document.querySelectorAll("iframe");
    /*var section = document.querySelectorAll(".section");*/
    // console.log(section);

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

    var images = document.getElementsByTagName("img");
    var iframes = document.getElementsByTagName("iframe");
    document.onreadystatechange = function(e)
    {
        if (document.readyState === 'complete')
        {
            //dom is ready, window.onload fires later
            for (var im = 0; im < images.length; im++) {
                images[im].setAttribute("loading", "lazy");
                images[im].onload = function () {
                    readsectionpositions();
                };
            }
            for (var im = 0; im < iframes.length; im++) {
                iframes[im].setAttribute("loading", "lazy");
                iframes[im].onload = function () {
                    readsectionpositions();
                };
            }
        }
    };

    window.onload = function() {

        // insert into DOM
        document.body.appendChild(ttBox);

        // Handle lazy-loading of iframes (videos)
        while(iframes.length > 0) {
            const embed = iframes[0];
            const clonedEmbed = embed.cloneNode(true);
            const wrapper = document.createElement('div');
            wrapper.classList = embed.classList;
            wrapper.style.position = 'relative';
            wrapper.classList.add('lazyembed');
            let if_image;
            if(clonedEmbed.hasAttribute('data-placeholder')) {
                if_image = document.createElement('img');
                if_image.className = 'center';
                if_image.setAttribute('src', clonedEmbed.getAttribute('data-placeholder'));
                if_image.style.filter = 'brightness(70%)';
                if(clonedEmbed.hasAttribute('width')) {
                    if_image.setAttribute('width', clonedEmbed.getAttribute('width'));
                }
                if(clonedEmbed.hasAttribute('height')) {
                    if_image.setAttribute('height', clonedEmbed.getAttribute('height'));
                }
            }
            const overlayText = document.createElement('div');
            overlayText.className = 'lazyembed__text';
            overlayText.innerHTML = 'Click to load';
            overlayText.setAttribute('style', 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size: 5em; pointer-events:none;');

            if(if_image) {
                wrapper.appendChild(if_image);
                if_image.addEventListener('click', () => {
                    overlayText.style.display = 'none';
                    if_image.parentNode.replaceChild(clonedEmbed, if_image);
                    if(clonedEmbed.hasAttribute('data-src')) {
                        clonedEmbed.setAttribute('src', clonedEmbed.getAttribute('data-src'));
                    }
                }, false);
            }
            wrapper.appendChild(overlayText);
            embed.parentNode.replaceChild(wrapper, embed);
        }

        readsectionpositions();

        // Make table of contents pin-able with clicks
        var toc = document.getElementById("table-of-contents");
        var txtoc = document.getElementById("text-table-of-contents");
        if(toc != null) {
            toc.addEventListener("mouseover", function() {
                txtoc.style.display = "block";
            });
            toc.addEventListener("mouseout", function() {
                if (! toc.classList.contains("pinned") ) {
                    txtoc.style.display = "none";
                }
            });
            toc.addEventListener("click", (evt) => {
                if (evt.target.tagName != "A") {
                    if(! toc.classList.contains("pinned")) {
                        toc.classList.add("pinned");
                        toc.style.background = "#3b3b3b";
                        toc.style.borderStyle = "groove";
//                        txtoc.style.display = "block";
                    } else {
                        toc.classList.remove("pinned");
                        toc.style.background = "#2b2b2b";
                        toc.style.borderStyle = "none";
//                        txtoc.style.display = "none";
                    }
                }
            });
        }

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
                if(this.style.textDecorationStyle == "wavy") {
                     this.style.textDecorationStyle = "solid";
                } else {
                    this.style.textDecorationStyle = "wavy";
                    console.log(this.content);
                }
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
