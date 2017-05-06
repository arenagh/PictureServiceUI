const app = angular.module("pictureApp", []);

app.value('pageInfo', {currentFolder: "", currentPictureId: 0, infoList: [], tags: []});

app.factory("showPicture", ["$window", ($window) => {
	return (id, picBase) => {
		const child = $window.open("", "pic");
		const width = child.innerWidth;
		const height = child.innerHeight;
		child.onfocus = function(event) {
			child.blur();
			this.focus();
		}
	
		const url = picBase + id + (((width == 0) || (height == 0)) ? "" : ("?width=" + width + "&height=" + height));
	
		$window.open(url, "pic");
	};
}]);

class MenuController {
	
	constructor() {
		const dummy = "dummy";
	}
	
	get isFolder() {
		return (this.page == "folder");
	}
	
	get isTmp() {
		return (this.page == "tmp");
	}
	
	get isDownloaded() {
		return (this.page == "downloaded");
	}
}

app.component("menu", {
	bindings: {
		page: "<"
	},
	templateUrl: "template/menu.html",
	controller: MenuController
});

class CurrentFolderController {
	
	constructor(pageInfo) {
		this.pageInfo = pageInfo;
	}
}

app.component("currentFolder", {
	templateUrl: "template/current_folder.html",
	controller: ["pageInfo", CurrentFolderController]
});

class NavButtonsController {
	
	constructor(pageInfo, showPicture) {
		this.pageInfo = pageInfo;
		this.showPic = showPicture;
		if ((this.folderListUrl != undefined) && (folderListUrl != null)) {
			getFolders(this.folderListUrl);
		}
	}
	
	startPic() {
		this.pageInfo.currentPictureId = 0;
		this.showPic(this.pageInfo.infoList[0].id, this.picBase);
	}
	
	prevPic() {
		this.changePic(-1);
	}
	
	nextPic() {
		this.changePic(1);
	}
	
	endPic() {
		this.pageInfo.currentPictureId = this.pageInfo.infoList.length - 1;
		this.showPic(this.pageInfo.infoList[this.pageInfo.currentPictureId].id, this.picBase);
	}
	
	changePic(r) {
		const dest = this.pageInfo.currentPictureId + r;
		if ((dest < 0) || (dest >= this.pageInfo.infoList.length)) {
			return;
		}
		
		this.pageInfo.currentPictureId = dest;
		this.showPic(this.pageInfo.infoList[dest].id, this.picBase);
	};
}

app.component("navButtons", {
	bindings: {
		picBase: "<"
	},
	templateUrl: "../html/template/nav_buttons.html",
	controller: ["pageInfo", "showPicture", NavButtonsController]
});

class TagButtonsController {
	
	constructor(pageInfo, $http) {
		this.pageInfo = pageInfo;
		this.$http = $http;
	}
	
	loadTags() {
		const ctrl = this;
		this.$http.get(this.folderListUrl).
	   then(function(response) {
	    	ctrl.tags = response.data;
	    });
	}
	
	showPictureList(tag) {
		this.pageInfo.currentFolder = tag;
		
		const pageInfo = this.pageInfo;
		this.$http.get(this.infoListBase + tag).
		then(function(response) {
	    	const infos = [];
	    	for (const key in response.data) {
	    		const value = response.data[key];
	    		if (value.created) {
	    			value.created = new Date(value.created);
	    		}
	    		if (value.downloaded) {
	    			value.downloaded = new Date(value.downloaded);
	    		}
	    		value.id = key
	    		infos.push(value);
	    	}
			
			pageInfo.infoList = infos.sort((p1, p2) => {
				return p2.downloaded - p1.downloaded;
			});
		});
	}
	
}

app.component("tagButtons", {
	bindings: {
		infoListBase: "<",
		folderListUrl: "<"
	},
	templateUrl: "../html/template/tag_buttons.html",
	controller: ["pageInfo", "$http", TagButtonsController]
});

class PictureListController {

	constructor(pageInfo, showPicture, $http) {
		this.pageInfo = pageInfo;
		this.showPic = showPicture;
		this.$http = $http;
	}
	
	get infoList() {
		return this.pageInfo.infoList;
	}
	
	showPicture($event, $index) {
	
		this.pageInfo.currentPictureId = $index;
		const picInfo = this.pageInfo.infoList[$index];
		this.showPic(picInfo.id, this.picBase);
		
		$event.stopPropagation();
	};

}

app.component("pictureList", {
	bindings: {
		picBase: "<",
		infoListBase: "<"
	},
	templateUrl: "../html/template/picture_list.html",
	controller: ["pageInfo", "showPicture", "$http", PictureListController]
});



//angular.module('pictureApp', [])
//.controller('pictureController', ['$scope', '$http', '$window', function($scope, $http, $window) {
//	
//	$scope.init = function(infoListBase, picBase, folderListUrl) {
//		$scope.infoListBase = infoListBase;
//		$scope.picBase = picBase;
//		$scope.curFolder = "";
//		$scope.curPicture = 0;
//		if ((folderListUrl != undefined) && (folderListUrl != null)) {
//			getFolders(folderListUrl);
//		}
//		$scope.menuHeight = document.getElementById("menu-fix").clientHeight;
//		$scope.contentsHeight = ($window.innerHeight - $scope.menuHeight) + "px";
//		angular.element($window).on('load resize', function() {
//			$scope.contentsHeight = ($window.innerHeight - $scope.menuHeight) + "px";
//		});
//	};
//	
//	$scope.showFolder = function(folder) {
//		$http.get($scope.infoListBase + folder).
//	    then(function(data, status, headers, config) {
//	    	var infos = [];
//	    	for (key in data) {
//	    		var value = data[key];
//	    		if (value.created) {
//	    			value.created = new Date(value.created);
//	    		}
//	    		if (value.downloaded) {
//	    			value.downloaded = new Date(value.downloaded);
//	    		}
//	    		value.id = key
//	    		infos.push(value);
//	    	}
//			$scope.infoList = infos.sort(function(p1, p2) {
//				return p2.downloaded - p1.downloaded; 
//			});
//    		$scope.curFolder = folder;
//    		$scope.curPicture = 0;
//	    });
//	};
//	
//	$scope.showPicture = function(event, index) {
//
//		var picInfo = $scope.infoList[index];
//		showPic(picInfo.id);
//		
//		$scope.curPicture = index;
//		
//		event.stopPropagation();
//	};
//	
//	$scope.submitAfterReset = function(form) {
//		var urls = $scope.urlLines.split(/\r\n|\r|\n/);
//		$http.post("../resources/folder/download_tmp/" + $scope.curFolder, urls).
//		then(function(data, status, config) {
//			$scope.urlLines = "";
//			form.$setPristine();
//			form.$setUntouched();
//		}, function(data, status, headers, config) {
//			$window.alert("failed image downloading")
//		});
//	};
//	
//	$scope.nextPic = function() {
//		changePic(1);
//	};
//	$scope.prevPic = function() {
//		changePic(-1);
//	};http://localhost/picture/html/folder.html
//	$scope.startPic = function() {
//		showPic($scope.infoList[0].id);
//		$scope.curPicture = 0;
//	};
//	$scope.endPic = function() {
//		var last = $scope.infoList.length - 1;
//		showPic($scope.infoList[last].id);
//		$scope.curPicture = last;
//	};
//	
//	function getFolders(url) {
//		$http.get(url).
//	    then(function(data, status, headers, config) {
//	    	$scope.folderList = data;
//	    });
//	};
//	
//	function changePic(r) {
//		var dest = $scope.curPicture + r;
//		if ((dest < 0) || (dest >= $scope.infoList.length)) {
//			return;
//		}
//		
//		var picInfo = $scope.infoList[dest];
//		showPic(picInfo.id);
//		$scope.curPicture = dest;
//	};
//	
//	function showPic(id) {
//		var child = $window.open("", "pic");
//		var width = child.innerWidth;
//		var height = child.innerHeight;
//		child.onfocus = function(event) {
//			child.blur();
//			this.focus();
//		}
//		
//		var url = $scope.picBase + id + (((width == 0) || (height == 0)) ? "" : ("?width=" + width + "&height=" + height));
//		
//		$window.open(url, "pic");
//	}
//}]);
