angular.module('pictureApp', [])
.controller('pictureController', ['$scope', '$http', '$window', function(scope, http, window) {
	
	scope.init = function(infoListBase, picBase, folderListUrl) {
		scope.infoListBase = infoListBase;
		scope.picBase = picBase;
		scope.curFolder = "";
		scope.curPicture = 0;
		if ((folderListUrl != undefined) && (folderListUrl != null)) {
			getFolders(folderListUrl);
		}
		scope.menuHeight = document.getElementById("menu-fix").clientHeight;
		scope.contentsHeight = (window.innerHeight - scope.menuHeight) + "px";
		angular.element(window).on('load resize', function() {
			scope.contentsHeight = (window.innerHeight - scope.menuHeight) + "px";
		});
	};
	
	scope.showFolder = function(folder) {
		http.get(scope.infoListBase + folder).
	    success(function(data, status, headers, config) {
	    	var infos = [];
	    	for (key in data) {
	    		var value = data[key];
	    		if (value.created) {
	    			value.created = new Date(value.created);
	    		}
	    		if (value.downloaded) {
	    			value.downloaded = new Date(value.downloaded);
	    		}
	    		value.id = key
	    		infos.push(value);
	    	}
			scope.infoList = infos.sort(function(p1, p2) {
				return p2.downloaded - p1.downloaded; 
			});
    		scope.curFolder = folder;
    		scope.curPicture = 0;
	    }).
	    error(function(data, status, headers, config) {
	    });
	};
	
	scope.showPicture = function(event, index) {

		var picInfo = scope.infoList[index];
		showPic(picInfo.id);
		
		scope.curPicture = index;
		
		event.stopPropagation();
	};
	
	scope.submitAfterReset = function(form) {
		var urls = scope.urlLines.split(/\r\n|\r|\n/);
		http.post("../resources/folder/download_tmp/" + scope.curFolder, urls).
		success(function(data, status, config) {
			scope.urlLines = "";
			form.$setPristine();
			form.$setUntouched();
		}).
		error(function(data, status, headers, config) {
			window.alert("failed image downloading")
		});
	};
	
	scope.nextPic = function() {
		changePic(1);
	};
	scope.prevPic = function() {
		changePic(-1);
	};
	scope.startPic = function() {
		showPic(scope.infoList[0].id);
		scope.curPicture = 0;
	};
	scope.endPic = function() {
		var last = scope.infoList.length - 1;
		showPic(scope.infoList[last].id);
		scope.curPicture = last;
	};
	
	function getFolders(url) {
		http.get(url).
	    success(function(data, status, headers, config) {
	    	scope.folderList = data;
	    }).
	    error(function(data, status, headers, config) {
	    });
	};
	
	function changePic(r) {
		var dest = scope.curPicture + r;
		if ((dest < 0) || (dest >= scope.infoList.length)) {
			return;
		}
		
		var picInfo = scope.infoList[dest];
		showPic(picInfo.id);
		scope.curPicture = dest;
	};
	
	function showPic(id) {
		var child = window.open("", "pic");
		var width = child.innerWidth;
		var height = child.innerHeight;
		child.onfocus = function(event) {
			child.blur();
			this.focus();
		}
		
		var url = scope.picBase + id + (((width == 0) || (height == 0)) ? "" : ("?width=" + width + "&height=" + height));
		
		window.open(url, "pic");
	}
}]);
