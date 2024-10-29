<circular-menu>
    <div class="pie-container" style="top: {opts.top}px; left: {opts.left}px" onwheel={rotate}>
        <ul class="pie">
            <li class="slice {highlight == option ? 'active' : ''} {option.dummy ? 'dummy' : ''} {option.type}" each={lines} style="transform: rotate({deg}deg) skew(-{skew}deg);" onmouseover={mouseover} onclick={mouseClick} oncontextmenu={onContext}>
                <a class="slice-contents" style="transform: skew({skew}deg) rotate({unrotate}deg);">
                    <span if={!option.dummy}>{option}</span>
                </a>
            </li>
            <div each={lines} class="line {hidden ? 'hidden' : ''} {option.dummy ? 'dummy' : ''} {highlight == option ? 'active' : ''}" style="transform: rotate({deg}deg);"></div>
        </ul>
    </div>

    <style>
        .pie-highlight {
            position: fixed;
            width: 400px;
            text-align: center;
            z-index: 50;
            user-select: none; /* Standard */
        }
        .pie-highlight span {
            background-color: rgba(54, 142, 224, 1);
            color: white;
			padding: 8px;
			font-size: 16px;
			border-radius: 5px;
		}
        .pie-container {
            position: fixed;
            z-index: 50;
        }
        .pie {
            position: relative;
            padding: 0;
            width: 400px; height: 400px;
            border-radius: 50%;
            border: solid 1px rgba(186,183,180,0.5);
        }
        .line {
            position: absolute;
            height: 1px;
            width: 50%;
            top: 50%;
            left: 50%;
            transform-origin: 0% 50%;
            background-color: rgb(54, 142, 224);
        }
        .line.hidden {
            display: none;
        }
        .line.dummy {
        	background-color: rgba(150, 150, 150, 1);
        }
        .slice {
            overflow: hidden;
            position: absolute;
            top: 0; right: 0;
            width: 50%; height: 50%;
            transform-origin: 0% 100%;
        }
        .slice a {
        	font-size: 16px;
        	color: #fff;
        }
        .slice-contents {
            text-align: center;
            position: absolute;
            left: -100%;
            width: 200%;
            height: 200%;
            border-radius: 50%;
            background-color: rgba(54, 142, 224, 0.75);
        }
        .slice-contents span {
            position: relative;
            display: inline-block;
            padding-top: 12px;
            font-weight: bold;
            -webkit-user-select: none; /* Safari */
            -moz-user-select: none; /* Firefox */
            -ms-user-select: none; /* IE10+/Edge */
            user-select: none; /* Standard */
        }
        .slice.remove .slice-contents {
        	background-color: rgba(255, 68, 51, 0.75);
        }
        .slice.remove.active .slice-contents {
        	background-color: rgb(255, 68, 51);
        }
        .slice.active .slice-contents {
            background-color: rgb(54, 142, 224);
        } /* highlight on hover */
        li.slice.dummy .slice-contents {
        	background-color: rgba(222, 222, 222, 0.75);
        }
        </style>
    <script>
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

        rotate(e) {
            e.preventDefault();
            /*if(Math.abs(e.deltaY) < 11) {
                this.manualRot += e.deltaY*=2;
            } else {
                this.manualRot += e.deltaY/17;
            }
            this.calcValues();*/
        }
        calcValues() {
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
        }
        mouseover(e) {
            if(e.item.option.dummy) {
                this.highlight = null;
                return;
            }
            this.highlight = e.item.option;
        }
        mouseClick(e) {
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
        }

        onContext(e) {
            var circleCenter = {x: this.opts.left+200, y: this.opts.top+200};
            var clickPos = {x: e.clientX, y: e.clientY};
            var dist = Math.sqrt(Math.pow(circleCenter.x - clickPos.x, 2) + Math.pow(circleCenter.y - clickPos.y, 2));
            if(dist > 200) {
                e.preventDefault();
                e.stopPropagation();
                opts.observer.trigger('rightclickoutsidemenu', e);
            }
        }

    </script>
</circular-menu>
