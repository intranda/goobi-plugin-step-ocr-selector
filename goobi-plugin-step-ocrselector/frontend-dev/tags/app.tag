<app>
	<link rel="stylesheet" href="/goobi/plugins/{plugin_name}/css/style.css">
	<div class="box box-color lightgrey box-bordered">
         <div class="box-title">
             <h3>
                 <i class="fa fa-puzzle-piece"></i>
                 OCR Auswahl
             </h3>
			<div class="actions">
				<a class="btn btn-mini btn-default" onclick={save}>Speichern</a>
				<a class="btn btn-mini btn-default" onclick={leave}>Plugin verlassen</a>
			</div>
		</div>

		<div class="box-content" style="background-color:#eee">
			<form>
				<label id="checkboxSelectAllLabel">
                    <input type="checkbox" id="checkboxSelectAll" onchange={selectDeselectAll}>
                    Alle / keines auswählen
                </label>
			</form>
			<div class="structure-data-editor__thumbnails" ref="thumbnailWrapper" id="structure-data-thumbs">
				<div each={image in images} class="structure-data-editor__thumbnail">
					<figure>
						<a onclick={imageClick} onmouseenter={mouseenterImage} onmouseleave={mouseleaveImage}>
							<metsImage metsimage={image} observer={menuObserver} processid={generalOpts.processId}></metsImage>
						</a>
						
						<figcaption class="structure-data-editor__thumbnail-image-order">
							{image.label}
						</figcaption>
						<div if={image.blur} class="blurred" onclick={imageClick} onmouseenter={mouseenterImage} onmouseleave={mouseleaveImage}></div>
					</figure>
				</div>
			</div>
			<div class="footer-actions">
				<a class="btn btn-mini btn-default" onclick={save}>Speichern</a>
				<a class="btn btn-mini btn-default" onclick={leave}>Plugin verlassen</a>
			</div>
		</div>
	</div>
	
	<div class="structure-data-editor__bigimage" if={showBigImage} onclick={hideBigImage}>
		<img id="bigImage" src="{bigImageUrl}" />
	</div>


	<circular-menu if={showMenu} left={left} top={top} values={menuItems} observer={menuObserver}></circular-menu>
	
	<script>
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
		
		getSavedData() {
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
		}

		selectDeselectAll(e) {
			var checkbox = e.target;
			if (checkbox.checked) {
				console.log("select all")
				this.selectAll();
			} else {
				this.deselectAll();
			}
			console.log(this.images)
			this.blurImages();
			this.update();
		}

		selectAll() {
			for(var image of this.images) {
				image.selected = true;
			}
		}

		deselectAll() {
			for(var image of this.images) {
				image.selected = false;
			}
		}
		
		save() {
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
		}
		
		leave() {
		    this.save().then( () => {
		    	document.getElementById("restPluginFinishLink").click();
		    });
		}
		
		this.menuObserver.on('rightclickoutsidemenu', (e) => {
		    this.showMenu = false;
		    this.update();
		    //document.elementFromPoint(e.clientX, e.clientY).click();
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
		
		openMenu(e) {
		    this.showMenu = true;
		    var height = document.documentElement.clientHeight;
		    var width = document.documentElement.clientWidth;
		    this.left = Math.min(Math.max(0, e.clientX-201), width-401);
		    this.top = Math.min(Math.max(50, e.clientY-201), height-401);
		    console.log(this.top, height)
		    this.update();
		    return false;
		}
		
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
		
		mouseenterImage(e) {
		    this.mouseOverImage = e.item.image;
		}
		
		mouseleaveImage() {
		    this.mouseOverImage = null;
		}
		
		imageClick(e) {
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
        }
		
		blurImages() {
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
		}
		
		unSelectImages() {
		    for(var image of this.images) {
		        image.blur = false;
		        image.selected = false;
		    }
		    this.blurImages();
		}
		
		hideBigImage() {
		    this.showBigImage = false;
		}
		
		this.keydownListener =  function(e) {
			console.log("key down")
			
			if (e.keyCode == 65) {
				e.preventDefault();
				e.stopPropagation();
				if (e.ctrlKey) {
    				var checkbox = document.getElementById('checkboxSelectAll');
    				checkbox.checked = !e.shiftKey;
					if (!e.shiftKey) {
						this.selectAll();
					} else {
						this.deselectAll();
					}
					this.blurImages();
					this.update();
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
		    	    // ausblenden
		    	    this.hideBigImage();
		    	} else {
			    	this.showBigImage = true;
			    	this.bigImageUrl = this.getImageUrl(this.mouseOverImage.location, 2000, 2000);
		    	}
		    	this.update();
		    }
		}.bind(this);
		
		document.addEventListener("keydown", this.keydownListener);
		
		getImageName(location) {
    	    let lastSlash = Math.max(location.lastIndexOf("/"), location.lastIndexOf("\\"));
    	    let lastDot = location.lastIndexOf(".");
    	    return location.substring(lastSlash+1, lastDot);
    	}
    	
    	getImageUrl(location, width, height) {
    	    let imageName = this.getImageName(location);
    	    let processId = this.generalOpts.processId;
    	    return `/goobi/api/process/image/${processId}/media/${imageName}/full/!${height},${width}/0/default.jpg`;
    	}
	</script>
</app>