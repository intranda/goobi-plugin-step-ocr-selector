riot.tag2('app', '<link rel="stylesheet" href="/goobi/plugins/{plugin_name}/css/style.css"><div class="box box-color lightgrey box-bordered"><div class="box-title"><h3><i class="fa fa-puzzle-piece"></i> OCR Auswahl </h3><div class="actions"><a class="btn btn-mini btn-default" onclick="{save}">Speichern</a><a class="btn btn-mini btn-default" onclick="{leave}">Plugin verlassen</a></div></div><div class="box-content" style="background-color:#eee"><form><input type="checkbox" id="checkboxSelectAll" name="selector" onclick="{selectDeselectAll}"><label id="checkboxSelectAllLabel" for="selector">Alle / keines ausw&auml;hlen</label></form><div class="structure-data-editor__thumbnails" ref="thumbnailWrapper" id="structure-data-thumbs"><div each="{image in images}" class="structure-data-editor__thumbnail"><figure><a onclick="{imageClick}" onmouseenter="{mouseenterImage}" onmouseleave="{mouseleaveImage}"><metsimage metsimage="{image}" observer="{menuObserver}" processid="{generalOpts.processId}"></metsImage></a><figcaption class="structure-data-editor__thumbnail-image-order"> {image.label} </figcaption><div if="{image.blur}" class="blurred" onclick="{imageClick}" onmouseenter="{mouseenterImage}" onmouseleave="{mouseleaveImage}"></div></figure></div></div><div class="footer-actions"><a class="btn btn-mini btn-default" onclick="{save}">Speichern</a><a class="btn btn-mini btn-default" onclick="{leave}">Plugin verlassen</a></div></div></div><div class="structure-data-editor__bigimage" if="{showBigImage}" onclick="{hideBigImage}"><img id="bigImage" riot-src="{bigImageUrl}"></div><circular-menu if="{showMenu}" left="{left}" top="{top}" values="{menuItems}" observer="{menuObserver}"></circular-menu>', '', '', function(opts) {
		this.generalOpts = window[window["plugin_name"]];
		function Observer() {
		    riot.observable(this);
		}
		this.menuObserver = new Observer();
		this.images = [];
		this.imageMap = {};
		this.menuItems = ["antiqua", "fraktur", "keine OCR"];

		this.on("mount", () => {
		    $.ajax( {
			        url: "/goobi/plugins/ocrselector/" + this.generalOpts.processId + "/dd",
			        type: "GET",
			        datatype: "JSON"
			    }).then(function(data) {
			        this.images = ugh.renderImages(data);
			        for(var image of this.images) {
			            this.imageMap[image.identifier] = image;
			        }
			        this.getSavedData();
			        this.update();
			    }.bind(this))
		})

		this.getSavedData = function() {
		    $.ajax( {
		        url: "/goobi/plugins/ocrselector/" + this.generalOpts.processId + "/saved",
			        type: "GET",
			        datatype: "JSON"
		    }).then(function(data) {
		        if(data.savedData) {
			        for(var image of this.images) {
			            var name = this.getImageName(image.location);
			            image.label = data.savedData[name];
			        }
		        } else {
		            for(var image of this.images) {
			            image.label = data.defaultValue;
			        }
		        }
		        this.update();
		    }.bind(this))
		}.bind(this)

		this.selectDeselectAll = function() {
			var checkbox = document.getElementById('checkboxSelectAll');
			if (checkbox.checked) {
				this.selectAll();
			} else {
				this.deselectAll();
			}
			this.blurImages();
			this.update();
		}.bind(this)

		this.selectAll = function() {
			for(var image of this.images) {
				image.selected = true;
			}
		}.bind(this)

		this.deselectAll = function() {
			for(var image of this.images) {
				image.selected = false;
			}
		}.bind(this)

		this.save = function() {
		    var saveData = {};
		    for(var image of this.images) {
	            var name = this.getImageName(image.location);
	            saveData[name] = image.label;
		    }
		    return $.ajax({
		        url: "/goobi/plugins/ocrselector/" + this.generalOpts.processId + "/results",
		        type:"POST",
		        contentType: "application/json; charset=utf-8",
		        data: JSON.stringify(saveData)
		    })
		}.bind(this)

		this.leave = function() {
		    this.save().then( () => {
		    	document.getElementById("restPluginFinishLink").click();
		    });
		}.bind(this)

		this.menuObserver.on('rightclickoutsidemenu', (e) => {
		    this.showMenu = false;
		    this.update();

		})

		this.menuObserver.on("itemselected", (option) => {
		    console.log("item selceted handler")
		    for(var image of this.images) {
		        if(image.selected) {
		        	image.label = option;
		        }
		    }
		    console.log(this.images)
		    this.showMenu = false;
		    this.unSelectImages();
		    this.update();
		})

		this.menuObserver.on("openMenu", (e, image) => {
		    let selCount = 0;
		    for(var im of this.images){
		        if(im.selected) {
		            selCount++;
		        }
		    }
		    if(selCount < 2) {
		        this.unSelectImages();
		    	image.selected = true;
		    }
		    this.openMenu(e);
		})

		this.openMenu = function(e) {
		    this.showMenu = true;
		    var height = document.documentElement.clientHeight;
		    var width = document.documentElement.clientWidth;
		    this.left = Math.min(Math.max(0, e.clientX-201), width-401);
		    this.top = Math.min(Math.max(50, e.clientY-201), height-401);
		    console.log(this.top, height)
		    this.update();
		    return false;
		}.bind(this)

		this.clickListener = function(e) {
		    if(e.button === 2) {
		        e.preventDefault();
		        e.stopPropagation();
		        return false;
		    }
		    if(this.showAltMenu) {
		        this.showAltMenu = false;
		    } else if(this.showMenu) {
		    	this.showMenu = false;
		    } else {
	            this.unSelectImages();
	        }
		    this.update();
		}.bind(this);

		document.addEventListener("click", this.clickListener);

		this.mouseenterImage = function(e) {
		    this.mouseOverImage = e.item.image;
		}.bind(this)

		this.mouseleaveImage = function() {
		    this.mouseOverImage = null;
		}.bind(this)

		this.imageClick = function(e) {
		    e.preventDefault();
		    e.stopPropagation();
            if(e.ctrlKey) {
                e.item.image.selected = !e.item.image.selected;
            } else if(e.shiftKey) {
                var startSelected = false;
                var startClick = false;
                for(var image of this.images) {
                    if(image.selected) {
                        if(startClick) {
                            break;
                        }
                        startSelected = true;
                    }
                    if(image.identifier == e.item.image.identifier) {
                        if(startSelected) {
                            image.selected = true;
                            break;
                        }
                        startClick = true;
                    }
                    if(startClick || startSelected) {
                        image.selected = true;
                    }
                }
            } else {
                for(var image of this.images) {
                    image.selected = false;
                }
                e.item.image.selected = true;
            }
           	this.blurImages();
            return false;
        }.bind(this)

		this.blurImages = function() {
		    var count = 0;
		    for(var image of this.images) {
		        if(image.selected) {
		            count++;
		        }
		    }
		    if(count > 1) {
			    for(var image of this.images) {
			        if(!image.selected) {
			            image.blur = true;
			        } else {
			            image.blur = false;
			        }
			    }
		    } else {
		        for(var image of this.images) {
		            image.blur = false;
			    }
		    }
		}.bind(this)

		this.unSelectImages = function() {
		    for(var image of this.images) {
		        image.blur = false;
		        image.selected = false;
		    }
		    this.blurImages();
		}.bind(this)

		this.hideBigImage = function() {
		    this.showBigImage = false;
		}.bind(this)

		this.keydownListener =  function(e) {
			console.log("key down")

			if (e.keyCode == 65) {
				e.preventDefault();
				e.stopPropagation();
				var checkbox = document.getElementById('checkboxSelectAll');
				checkbox.checked = !e.shiftKey;
				if (e.ctrlKey) {
					if (!e.shiftKey) {
						this.selectAll();
					} else {
						this.deselectAll();
					}
				}
				return;
			}

			if(e.keyCode === 27) {
		        if(this.showAltMenu) {
			        this.showAltMenu = false;
			    } else if(this.showMenu) {
		        	this.showMenu = false;
		        } else if(this.showBigImage) {
		    	    this.hideBigImage();
		    	} else {
		            this.unSelectImages();
		        }
		        this.update();
		    }
		    if(e.keyCode === 32) {
		        e.preventDefault();
		    	e.stopPropagation();
		    	console.log(this.mouseOverImage);
		    	if(this.showBigImage) {

		    	    this.hideBigImage();
		    	} else {
			    	this.showBigImage = true;
			    	this.bigImageUrl = this.getImageUrl(this.mouseOverImage.location, 2000, 2000);
		    	}
		    	this.update();
		    }
		}.bind(this);

		document.addEventListener("keydown", this.keydownListener);

		this.getImageName = function(location) {
    	    let lastSlash = Math.max(location.lastIndexOf("/"), location.lastIndexOf("\\"));
    	    let lastDot = location.lastIndexOf(".");
    	    return location.substring(lastSlash+1, lastDot);
    	}.bind(this)

    	this.getImageUrl = function(location, width, height) {
    	    let imageName = this.getImageName(location);
    	    let processId = this.generalOpts.processId;
    	    return `/goobi/api/process/image/${processId}/media/${imageName}/full/!${height},${width}/0/default.jpg`;
    	}.bind(this)
});
riot.tag2('circular-menu', '<div class="pie-container" riot-style="top: {opts.top}px; left: {opts.left}px" onwheel="{rotate}"><ul class="pie"><li class="slice {highlight == option ? \'active\' : \'\'} {option.dummy ? \'dummy\' : \'\'} {option.type}" each="{lines}" riot-style="transform: rotate({deg}deg) skew(-{skew}deg);" onmouseover="{mouseover}" onclick="{mouseClick}" oncontextmenu="{onContext}"><a class="slice-contents" riot-style="transform: skew({skew}deg) rotate({unrotate}deg);"><span if="{!option.dummy}">{option}</span></a></li><div each="{lines}" class="line {hidden ? \'hidden\' : \'\'} {option.dummy ? \'dummy\' : \'\'} {highlight == option ? \'active\' : \'\'}" riot-style="transform: rotate({deg}deg);"></div></ul></div>', 'circular-menu .pie-highlight,[data-is="circular-menu"] .pie-highlight{ position: fixed; width: 400px; text-align: center; z-index: 50; user-select: none; } circular-menu .pie-highlight span,[data-is="circular-menu"] .pie-highlight span{ background-color: rgba(54, 142, 224, 1); color: white; padding: 8px; font-size: 16px; border-radius: 5px; } circular-menu .pie-container,[data-is="circular-menu"] .pie-container{ position: fixed; z-index: 50; } circular-menu .pie,[data-is="circular-menu"] .pie{ position: relative; padding: 0; width: 400px; height: 400px; border-radius: 50%; border: solid 1px rgba(186,183,180,0.5); } circular-menu .line,[data-is="circular-menu"] .line{ position: absolute; height: 1px; width: 50%; top: 50%; left: 50%; transform-origin: 0% 50%; background-color: rgb(54, 142, 224); } circular-menu .line.hidden,[data-is="circular-menu"] .line.hidden{ display: none; } circular-menu .line.dummy,[data-is="circular-menu"] .line.dummy{ background-color: rgba(150, 150, 150, 1); } circular-menu .slice,[data-is="circular-menu"] .slice{ overflow: hidden; position: absolute; top: 0; right: 0; width: 50%; height: 50%; transform-origin: 0% 100%; } circular-menu .slice a,[data-is="circular-menu"] .slice a{ font-size: 16px; color: #fff; } circular-menu .slice-contents,[data-is="circular-menu"] .slice-contents{ text-align: center; position: absolute; left: -100%; width: 200%; height: 200%; border-radius: 50%; background-color: rgba(54, 142, 224, 0.75); } circular-menu .slice-contents span,[data-is="circular-menu"] .slice-contents span{ position: relative; display: inline-block; padding-top: 12px; font-weight: bold; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } circular-menu .slice.remove .slice-contents,[data-is="circular-menu"] .slice.remove .slice-contents{ background-color: rgba(255, 68, 51, 0.75); } circular-menu .slice.remove.active .slice-contents,[data-is="circular-menu"] .slice.remove.active .slice-contents{ background-color: rgb(255, 68, 51); } circular-menu .slice.active .slice-contents,[data-is="circular-menu"] .slice.active .slice-contents{ background-color: rgb(54, 142, 224); } circular-menu li.slice.dummy .slice-contents,[data-is="circular-menu"] li.slice.dummy .slice-contents{ background-color: rgba(222, 222, 222, 0.75); }', '', function(opts) {
        this.manualRot = -90;
        this.on("update", () => {
            if(this.values != opts.values) {
                this.values = opts.values;
                this.calcValues();
            }
        });

        this.on("mount", () => {
            this.values = opts.values;
            this.calcValues();
        })

        this.rotate = function(e) {
            e.preventDefault();

        }.bind(this)
        this.calcValues = function() {
            this.manualRot = -180;
            this.num = this.values.length;
            this.highlight = null;
            this.height = 100;
            this.div = 1;
            this.startDeg = 0;

            this.deg = (360/Math.max(4, this.num));
            this.skew = 90 - this.deg;

            this.manualRot += this.deg;
            if(this.num < 4) {
                this.manualRot -= this.deg/2;
            }

            this.lines = [];
            var i
            for(i=0;i<this.num;i++) {
                var option = this.values[Math.floor(i/this.div)];
                var rotate = i*this.deg + this.startDeg + this.manualRot;
                this.lines.push({
                    deg: rotate,
                    unrotate: 90-(this.deg/2),
                    option: option,
                    hidden: this.div > 1 && i%this.div == 0
                });
            }

            for(var x=i; x<4; x++) {
                var option = {
                        dummy: true,
                        allLanguages: {de: "dummy_" + x}
                    };
                var rotate = x*this.deg + this.startDeg + this.manualRot;
                this.lines.push({
                    deg: rotate,
                    unrotate: 90-(this.deg/2),
                    option: option,
                    hidden: this.div > 1 && x%this.div == 0
                });
            }
        }.bind(this)
        this.mouseover = function(e) {
            if(e.item.option.dummy) {
                this.highlight = null;
                return;
            }
            this.highlight = e.item.option;
        }.bind(this)
        this.mouseClick = function(e) {
            if(e.item.option.dummy) {
                return;
            }
            var circleCenter = {x: this.opts.left+200, y: this.opts.top+200};
            var clickPos = {x: e.clientX, y: e.clientY};
            var dist = Math.sqrt(Math.pow(circleCenter.x - clickPos.x, 2) + Math.pow(circleCenter.y - clickPos.y, 2));
            if(dist <= 200) {
                console.log(e.item)
            	opts.observer.trigger('itemselected', e.item.option);
            }
        }.bind(this)

        this.onContext = function(e) {
            var circleCenter = {x: this.opts.left+200, y: this.opts.top+200};
            var clickPos = {x: e.clientX, y: e.clientY};
            var dist = Math.sqrt(Math.pow(circleCenter.x - clickPos.x, 2) + Math.pow(circleCenter.y - clickPos.y, 2));
            if(dist > 200) {
                e.preventDefault();
                e.stopPropagation();
                opts.observer.trigger('rightclickoutsidemenu', e);
            }
        }.bind(this)

});

riot.tag2('metsimage', '<div class="mets-image__wrapper {opts.metsimage.selected ? \'\' : \'\'}" id="{opts.metsimage.identifier}"><div class="mets-image__preloader" if="{preloader}"></div><div class="mets-image__image" riot-style="width:{width}px; height:{height}px;"><img ref="image" oncontextmenu="{onDsContext}" riot-src="{src}"><div if="{opts.metsimage.selected}" class="selected" onclick="{imageClick}" oncontextmenu="{onDsContext}"></div></div></div>', '', '', function(opts) {
    	this.preloader = false;
   		this.physNum = "-";
   		this.logicalNum = "-";
   		this.height = 400;
   		this.width = 400;
   		this.src = null;
   		this.tooltip = null;
   		this.tooltipLeft = 0;

    	this.on('mount', function() {
    		this.fetchDimensions();

    		this.refs.image.onload = function() {
        		this.preloader = false;
        		this.update();
    		}.bind(this);
    	}.bind(this));

    	this.fetchDimensions = function() {
    	    let imageName = this.getImageName(this.opts.metsimage.location);
    	    let processId = this.opts.processid;
    	    let url = `/goobi/api/process/image/${processId}/media/${imageName}/info.json`;
    	    fetch(url).then(resp => {
    	        resp.json().then(json => {
    	            var ratio = json.width / json.height;
    	            this.width = 400*ratio;
    	            this.update();
    	            this.createObserver();
    	        });
    	    })
    	}.bind(this)

    	this.getImageName = function(location) {
    	    let lastSlash = Math.max(location.lastIndexOf("/"), location.lastIndexOf("\\"));
    	    return location.substring(lastSlash+1);
    	}.bind(this)

    	this.getImageUrl = function(location, width, height) {
    	    let imageName = this.getImageName(location);
    	    let processId = this.opts.processid;
    	    return `/goobi/api/process/image/${processId}/media/${imageName}/full/!${height},${width}/0/default.jpg`;
    	}.bind(this)

    	this.createObserver = function() {
    		var observer;
    		var options = {
    		    rootMargin: "1200px 0px 1200px 0px",
    		    threshold: 0.9
    		};

    		observer = new IntersectionObserver(this.loadImages, options);
    		observer.observe(this.refs.image);
    	}.bind(this)

    	this.onDsContext = function(e) {
    	    e.preventDefault();
		    e.stopPropagation();
		    if(e.item.ds) {
		        e.item.ds.selected = true;
		    }
    		this.opts.observer.trigger("openMenu", e, this.opts.metsimage);
    	}.bind(this)

    	this.loadImages = function(entries, observer) {
    		entries.forEach( entry => {
    			if (entry.isIntersecting && !this.src) {
    				this.preloader = true;
    				this.src = this.getImageUrl(this.opts.metsimage.location, 1000, 1000);
    				this.update();
    			}
    		});
    	}.bind(this)
});
