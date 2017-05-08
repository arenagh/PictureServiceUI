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

class DownloadController {
	
	constructor(pageInfo, $http) {
		this.pageInfo = pageInfo;
		this.$http = $http;
	} 
	
	download(form) {
		const urls = this.urlLines.split(/\r\n|\r|\n/);
		const ctrl = this;
		this.$http.post("../resources/folder/download_tmp/" + this.pageInfo.currentFolder, urls).
		then(function(response) {
			ctrl.urlLines = "";
			form.$setPristine();
			form.$setUntouched();
		}, function(response) {
			$window.alert("failed image downloading");
		});
	}
}

app.component("downloadForm", {
	templateUrl: "../html/template/download_form.html",
	controller: ["pageInfo", "$http", DownloadController]
});

app.component("infoListLoad", {
	bindings: {
		infoListBase: "<"
	},
	templateUrl: "../html/template/info_list_load.html",
	controller: ["pageInfo", "$http", TagButtonsController]
});
