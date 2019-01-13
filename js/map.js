/**
 * Created by Wuwenbao on 2017/9/16.
 */
/**
 * 地图的相关操作都在这里啦
 */
function jfsdMap(c_lon,c_lat,siteId) {
    this.config = {

        level_1_url: 'http://www.fapaiwang.cn/map/api.php?type=d&siteId='+siteId,   //第一层
        level_2_url: 'http://www.fapaiwang.cn/map/api.php?type=b',   //第二层
        level_3_url: 'http://www.fapaiwang.cn/map/api.php?type=c',    //第三层
        gundong_url: 'http://www.fapaiwang.cn/map/api.php?type=g'    //左侧滚动数据(和第上面level_3_url一样，只是这个要加条数限制)

        /*level_1_url: 'http://local.fapw.com/map/api.php?type=d&siteId='+siteId,   //第一层
        level_2_url: 'http://local.fapw.com/map/api.php?type=b',   //第二层
        level_3_url: 'http://local.fapw.com/map/api.php?type=c',    //第三层
        gundong_url: 'http://local.fapw.com/map/api.php?type=g'    //左侧滚动数据(和第上面level_3_url一样，只是这个要加条数限制)*/
    };
    this.districts = [];
    this.bizcircles = [];
    this.communitys = [];
    this.gundongs = [];
    this.map = new BMap.Map("only-map", {minZoom: 11, maxZoom: 17});
    /**
     * 每次搜索变更的时候记得修改这里面的相关参数，就完事了
     */
    /*this.sousuo = {
        "keyword": null,        //关键词
        "sort": null,           //排序 price_asc | price_desc | area_asc | area_desc | mtime_asc | mtime_desc
        "min_price": null,      //最低价
        "max_price": null,      //最高价
        "min_area": null,       //最小面积
        "max_area": null,       //最大面积
        "room_count": null,      //房型
        "limit_offset": null,
        "limit_count": null
    };*/

    this.sousuo = {
        "keyword": null,        //关键词
        "orderId": null,           //排序 price_asc | price_desc | area_asc | area_desc | mtime_asc | mtime_desc
        "ext1": null,      //最低价
        "ext2": null,      //最高价
        "ext3": null,       //最小面积
        "is_phone":0
    };

    this.init(c_lon,c_lat);
    this.kongjian();
    this.gundong();
}

jfsdMap.prototype = {
    init: function (c_lon,c_lat) {
        this.map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
        this.map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
        this.map.addControl(new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT})); //添加标尺
        //this.map.addControl(new BMap.NavigationControl());
        //初始化中心点和缩放比例
        //



        //console.log(c_lon,c_lat);
        var point = new BMap.Point(c_lon, c_lat);
        this.map.centerAndZoom(point, 12);
        var self = this;
        this.map.addEventListener("zoomend", function () {
            self.zoomend();
        });
        this.map.addEventListener("moveend", function () {
            self.moveend();
        });
        this.map.addEventListener("load", function () {

        });
        //加载数据
        self.loadDistricts(function (s) {
            s.addDistricts();
        });
        self.loadBizcircles();
        self.loadGundongs(function (s) {
            s.addGundongs();
        });
    },

    /**
     * 右下角缩放控件
     */
    kongjian: function () {
        var self = this;
        addZoom = document.getElementById("add_zoom"),
            delZoom = document.getElementById("del_zoom");
        addZoom.addEventListener("click", function () {
            self.map.setZoom(self.map.getZoom() + 2);
        });
        delZoom.addEventListener("click", function () {
            self.map.setZoom(self.map.getZoom() - 2);
        });
    },

    /**
     * 左侧滚动列表
     */
    gundong: function () {
        var self = this,
            scroll_sign = false,
            scrolItems = document.getElementById("scroll_items");
        	scrolItems.addEventListener("scroll", function () {
				//console.log(this.scrollHeight, this.scrollTop + this.clientHeight);
				if (this.scrollTop + this.clientHeight >= this.scrollHeight) {
					if (scroll_sign) {
						return false;
					}
					scroll_sign = true;
					self.loadGundongs(function (s) {
						s.addGundongs();
						scroll_sign = false;
					});
				}
         	});
    },

    /**
     * 加载左侧滚动
     */
    loadGundongs: function (callback) {
        var self = this;
        var bs = this.map.getBounds();   //获取可视区域
        var bssw = bs.getSouthWest();   //可视区域左下角
        var bsne = bs.getNorthEast();   //可视区域右上角
        var tempData = this.sousuo;
        tempData.min_longitude = bssw.lng;
        tempData.max_longitude = bsne.lng;
        tempData.min_latitude = bssw.lat;
        tempData.max_latitude = bsne.lat;
		/*console.log(tempData.min_longitude);
        console.log(tempData.min_latitude);
        console.log(tempData.max_longitude);
        console.log(tempData.max_latitude);*/
		// = this.keyword;
        $.ajax({
            url: self.config.gundong_url,
            data: tempData,
            type: 'post',
            dataType: 'json',
            success: function (res) {
                if (res.status == 0) {
					//console.log(res.data);
                    //根据返回数据，需要做分页处理哦
                    self.gundongs = res.data;
                    if (callback !== undefined) {
                        setTimeout(function () {
                            callback.call(this, self);
                        }, 10);
                    }
                } else {
                    console.log('加载数据失败');
                }
            },
            error: function () {
                console.log('网络异常');
            }
        });
    },

    /**
     * 添加左侧滚动数据组装就在这里 待完善
     */
    addGundongs: function () {
        if (this.gundongs === undefined) {
            return false;
        }
		var  htm = '';
		//console.log(this.gundongs.length);
		$('#tot_num').html(this.gundongs.length);
        for (var i=0; i < this.gundongs.length; i++) {
		   var info = this.gundongs[i];
		   //console.log(info.url);
		   htm  += '<li class="list-item">'
  				+ '	  <a href="'+info.url+'" target="_blank">'
           	    + '			<div class="item-aside">'
            	+ '			  <img src="'+info.simg+'">'
            	+ '			</div>'
            	+ '			<div class="item-main">'
           	    + '			    <p class="item-tle">'+info.name+'</p>'
            	+ '				<p class="item-des">'
            	+ '					<span>'+info.house_type+'</span>'
           	    + '					<span>'+info.tot_area+'平米</span>'
            	+ '					<span>'+info.face+'</span>'
            	+ '				</p>'
            	+ '				<p class="item-des">'
            	+ '				   <span class="item-side">'+info.price+'万</span>'
            	+ '				</p>'
            	+ '			</div>'
            	+ '	   </a>'
           	    + '</li>';

        }
		//console.log(htm);
		if(htm==''){
			var htm = '未查到相关信息';
		}
		$('#r-content').html(htm);
    },
    /**
     * 获取地图操作句柄
     * @returns {BMap.Map}
     */
    getMap: function () {
        return this.map;
    },

    /**
     * 放大缩小事件处理
     */
    zoomend: function () {
        var self = this;
        if (this.map.getZoom() >= 16) {
            this.loadCommunitys(function (s) {
                s.addCommunitys();
            });
        } else if (this.map.getZoom() >= 14) {
            this.addBizcircles();
        } else {
            this.addDistricts();
        }
        this.loadGundongs(function (s) {
            s.addGundongs();
        });
    },

    /**
     * 拖动事件处理
     */
    moveend: function () {
        if (this.map.getZoom() >= 16) {
            this.loadCommunitys(function (s) {
                s.addCommunitys();
            });
        }
        this.loadGundongs(function (s) {
            s.addGundongs();
        });
    },

    /**
     * 加载第一层数据
     */
    loadDistricts: function (callback) {
        var self = this;
        $.ajax({
            url: self.config.level_1_url,
            data: self.sousuo,
            type: 'post',
            dataType: 'json',
            success: function (res) {
                if (res.status == 0) {
                    self.districts = res.data;
                    if (callback !== undefined) {
                        setTimeout(function () {
                            callback.call(this, self);
                        }, 10);
                    }
                }
            },
            error: function () {
                console.log('网络异常');
            }
        });
    },

    /**
     * 加载第二层数据
     */
    loadBizcircles: function (callback) {
        var self = this;
        $.ajax({
            url: self.config.level_2_url,
            data: self.sousuo,
            type: 'post',
            dataType: 'json',
            success: function (res) {
                if (res.status == 0) {
                    self.bizcircles = res.data;
                    if (callback !== undefined) {
                        setTimeout(function () {
                            callback.call(this, self);
                        }, 10);
                    }
                }
            },
            error: function () {
                console.log('网络异常');
            }
        });
    },

    /**
     * 加载第三层数据
     */
    loadCommunitys: function (callback) {
        var self = this;
        var bs = this.map.getBounds();   //获取可视区域
        var bssw = bs.getSouthWest();   //可视区域左下角
        var bsne = bs.getNorthEast();   //可视区域右上角
        var tempData = this.sousuo;
        tempData.min_longitude = bssw.lng;
        tempData.max_longitude = bsne.lng;
        tempData.min_latitude = bssw.lat;
        tempData.max_latitude = bsne.lat;

        $.ajax({
            url: self.config.level_3_url,
            data: tempData,
            type: 'post',
            dataType: 'json',
            success: function (res) {
                if (res.status == 0) {
                    self.communitys = res.data;
                    if (callback !== undefined) {
                        setTimeout(function () {
                            callback.call(this, self);
                        }, 10);
                    }
                }
            },
            error: function () {
                console.log('网络异常');
            }
        });
    },

    /**
     * 第一层添加全部行政区
     */
    addDistricts: function () {
        this.map.clearOverlays();
        for (var i in this.districts) {
            this.addLabel_1(this.districts[i]);
        }
    },

    /**
     * 第二层添加全部xxx不知道叫神
     */
    addBizcircles: function () {
        this.map.clearOverlays();
        for (var i in this.bizcircles) {
            this.addLabel_2(this.bizcircles[i]);
        }
    },

    /**
     * 第三层添加全部社区
     */
    addCommunitys: function () {
        this.map.clearOverlays();
        for (var i in this.communitys) {
            this.addLabel_3(this.communitys[i]);
        }
    },

    /**
     * 添加第一种label
     * @param district
     * @returns {BMap.Label}
     */
    addLabel_1: function (district) {
        var htm = '<div class="bubble-2 bubble-5 bubble">'
            + '		<p class="name" title="' + district.name + '">' + district.name + '</p>'
            + '		<p class="num"></p>'
            + '		<p><span class="count">' + district.house_count + '</span>套</p>'
            + '</div>';
		var center = new BMap.Point(district.longitude, district.latitude);
        var opts = {
            position: new BMap.Point(district.longitude, district.latitude),
            offset: {width: -30, height: -30}
        };
        var label = new BMap.Label(htm, opts);
        label.setStyle({
            "background-color": "rgba(189, 11, 11, 0)",
            "border": "0px solid rgb(255, 0, 0)",
            "color": "rgb(255, 255, 255)",
            "text-align": "center"
        });
        var ply;
        var self = this;
        label.addEventListener("mouseover", function () {
            label.setStyle({
                "z-index": 4
            });
            ply = self.addPly(district.position_border);
        });
        label.addEventListener("mouseout", function () {
            label.setStyle({
                "z-index": 2
            });
            self.map.removeOverlay(ply);
        });
        label.addEventListener("click", function () {
            self.map.setZoom(14);
			self.map.setCenter(center);
        });
        this.map.addOverlay(label);
        return label;
    },

    /**
     * 添加第二种label
     * @param bizcircle
     * @returns {BMap.Label}
     */
    addLabel_2: function (bizcircle) {
        var htm = '<div class="bubble-2 bubble">'
            + '		<p class="name" title="' + bizcircle.name + '">' + bizcircle.name + '</p>'
            + '		<p class="num"></p>'
            + '		<p class="count">' + bizcircle.house_count + '套</p>'
            + '</div>';

		var center = new BMap.Point(bizcircle.longitude, bizcircle.latitude);
        var opts = {
            position: new BMap.Point(bizcircle.longitude, bizcircle.latitude),
            offset: {width: -30, height: -30}
        };
        var label = new BMap.Label(htm, opts);
        label.setStyle({
            "background-color": "rgba(189, 11, 11, 0)",
            "border": "0px solid rgb(255, 0, 0)",
            "color": "rgb(255, 255, 255)",
            "text-align": "center"
        });
        var ply;
        var self = this;
        label.addEventListener("mouseover", function () {
            label.setStyle({
                "z-index": 4
            });
            ply = self.addPly(bizcircle.position_border);
        });
        label.addEventListener("mouseout", function () {
            label.setStyle({
                "z-index": 2
            });
            self.map.removeOverlay(ply);
        });
        label.addEventListener("click", function () {
            self.map.setZoom(16);
			self.map.setCenter(center);
        });
        this.map.addOverlay(label);
        return label;
    },

    /**
     * 添加第三种label
     * @param community
     * @returns {BMap.Label}
     */
    addLabel_3: function (community) {

		console.log(community.url);
		var htm = '<p class="bubble-3 bubble">'
            + '		<i class="num">' + community.name + '</i>'
            + '		<span class="name">'
            + '		<i class="name-des">'
            + '			<a href="' + community.url + '" target="_blank">&nbsp;' + community.price + '万&nbsp;</a>'
            + '		</i>'
            + '		</span>'
            + '		<i class="arrow-up">'
            + '			<i class="arrow"></i>'
            + '			<i></i>'
            + '		</i>'
            + '</p>';
        var opts = {
            position: new BMap.Point(community.longitude, community.latitude),
            offset: {width: -30, height: -30}
        };
        var label = new BMap.Label(htm, opts);
        label.setStyle({
            "background-color": "rgba(189, 11, 11, 0)",
            "border": "0px solid rgb(255, 0, 0)",
            "color": "rgb(255, 255, 255)",
            "text-align": "center"
        });
        var ply;
        label.addEventListener("mouseover", function () {
            label.setStyle({
                "z-index": 4
            });
        });
        label.addEventListener("mouseout", function () {
            label.setStyle({
                "z-index": 2
            });
        });
        label.addEventListener("click", function () {
            if (community.url !== undefined) {
                window.location.href = community.url;
            }
        });
        this.map.addOverlay(label);
        return label;
    },


    /**
     * 添加矩形选区
     * @param boundaries
     * @returns {BMap.Polygon}
     */
    addPly: function (boundaries) {
        var opts = {
            strokeWeight: 2,
            strokeColor: "#39AC6A",
            fillColor: "#89dead"
        };
        var ply = new BMap.Polygon(boundaries, opts); //建立多边形覆盖物
        this.map.addOverlay(ply);  //添加覆盖物
        return ply;
    },

    /**
     *
     * 得到一个随机的Point 测试用的
     * @returns {BMap.Point}
     */
    getRandomPoint: function () {
        return new BMap.Point(Math.random() * 40 + 85, Math.random() * 30 + 21);
    }
};
