//声明类,opts为类属性，初始化时传入（非必须，看实际需求）
function CustomOverlay(opts) {
    qq.maps.Overlay.call(this, opts);
};
//继承Overlay基类
CustomOverlay.prototype = new qq.maps.Overlay();
//实现构造方法
CustomOverlay.prototype.construct = function () {

    //创建了覆盖物的容器，这里我用了一个div，并且设置了样式
    this.dom = document.createElement('div');
    this.dom.style.cssText =
        'background:#0f0;color:white;position:absolute;' +
        'text-align:center;width:100px;height:30px';

    //将初始化的html填入到了窗口里，这根据您自己的需要决定是否加这属性
    this.dom.innerHTML = this.get('inithtml');

    //将dom添加到覆盖物层
    this.getPanes().overlayLayer.appendChild(this.dom);
};
//实现绘制覆盖物的方法（覆盖物的位置在此控制）
CustomOverlay.prototype.draw = function () {
    //获取地理经纬度坐标
    var position = this.get('position');
    if (position) {
        var pixel = this.getProjection().fromLatLngToDivPixel(position);
        this.dom.style.left = pixel.getX() + 'px';
        this.dom.style.top = pixel.getY() + 'px';
    }
};
//实现析构方法（类生命周期结束时会自动调用，用于释放资源等）
CustomOverlay.prototype.destroy = function () {
    //移除dom
    this.dom.parentNode.removeChild(this.dom);
};


function TXMap() {
    this.init();
}

TXMap.prototype = {
    init: function () {
        var box = document.getElementsByTagName('body')[0];
        var center = new qq.maps.LatLng(39.916527, 116.397128);
        var map = new qq.maps.Map(box, {
            center: center,
            zoom: 8
        });

        new CustomOverlay({
            map: map,
            position: center,
            inithtml: 'balabalaxiaomoxian'
        });
    }
};

var txmap = new TXMap();