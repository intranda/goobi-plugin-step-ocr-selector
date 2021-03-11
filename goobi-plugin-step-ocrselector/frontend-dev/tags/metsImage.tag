<metsImage>
	<div class="mets-image__wrapper {opts.metsimage.selected ? '' : ''}" id="{opts.metsimage.identifier}">
	    <div class="mets-image__preloader" if={preloader}></div>
	    
	    <div class="mets-image__image" style="width:{width}px; height:{height}px;">
	    	<img ref="image" oncontextmenu={onDsContext} src={src} />
		    <div if={opts.metsimage.selected} class="selected" onclick={imageClick} oncontextmenu={onDsContext}></div>
	    </div>
	</div>

    <script>
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
    	
    	fetchDimensions() {
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
    	}
    	
    	getImageName(location) {
    	    let lastSlash = Math.max(location.lastIndexOf("/"), location.lastIndexOf("\\"));
    	    return location.substring(lastSlash+1);
    	}
    	
    	getImageUrl(location, width, height) {
    	    let imageName = this.getImageName(location);
    	    let processId = this.opts.processid;
    	    return `/goobi/api/process/image/${processId}/media/${imageName}/full/!${height},${width}/0/default.jpg`;
    	}
    	
    	createObserver() {
    		var observer;
    		var options = {
    		    rootMargin: "1200px 0px 1200px 0px",
    		    threshold: 0.9
    		};
    		
    		observer = new IntersectionObserver(this.loadImages, options);
    		observer.observe(this.refs.image);
    	}
    	
    	onDsContext(e) {
    	    e.preventDefault();
		    e.stopPropagation();
		    if(e.item.ds) {
		        e.item.ds.selected = true;
		    }
    		this.opts.observer.trigger("openMenu", e, this.opts.metsimage);
    	}
    	
    	loadImages(entries, observer) {
    		entries.forEach( entry => {
    			if (entry.isIntersecting && !this.src) {
    				this.preloader = true;
    				this.src = this.getImageUrl(this.opts.metsimage.location, 1000, 1000);
    				this.update();
    			}
    		});
    	}
    </script>
</metsImage>