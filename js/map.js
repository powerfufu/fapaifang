function TXMap(options) {
    var defaults = {
        ele: 'map'
    };
    this.opts = Object.assign({}, defaults, options);
    this.init(39.903740, 116.397827);
}

TXMap.prototype = {
    /**
     * 初始化地图
     * @param lat   纬度
     * @param lng   经度
     */
    init: function (lat, lng) {
        var self = this;
        var center = new qq.maps.LatLng(lat, lng);
        self.map = new qq.maps.Map(document.getElementById(self.opts.ele), {
            center: center,
            zoom: 14
        });
        var customeOverlay = new CustomOverlay({
            lat: 39.903740,
            lng: 116.397827
        });
        customeOverlay.setMap(self.map);
    }
};

function CustomOverlay(options) {
    var defaults = {
        lat: '',
        lng: ''
    };
    this.opts = Object.assign({}, defaults, options);
    // 调用地图 api 计算出覆盖物的位置
    this.position = new window.qq.maps.LatLng(this.opts.lat, this.opts.lng);
}

CustomOverlay.prototype = new qq.maps.Overlay();

CustomOverlay.prototype.construct = function () {
    // 创建容器
    this.dom = document.createElement('div');
    this.dom.className = 'bubble';

    // 内容
    this.dom.innerHTML = '<p class="area">朝阳</p><p class="number"><span>1245</span>套</p>';
    // 添加 dom
    this.getPanes().overlayMouseTarget.appendChild(this.dom);
    // 设置自定义事件
    this.dom.onclick = function () {
        console.log('放大');
    };
};

CustomOverlay.prototype.draw = function () {
    //获取地理经纬度坐标
    var position = this.get('position');
    if (position) {
        var pixel = this.getProjection().fromLatLngToDivPixel(position);
        this.dom.style.left = pixel.getX() + 'px';
        this.dom.style.top = pixel.getY() + 'px';
    }
};

CustomOverlay.prototype.destroy = function () {
    //移除dom
    this.dom.parentNode.removeChild(this.dom);
};

