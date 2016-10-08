angular.module('adminApp', [])
.controller('adminController', ['$scope', '$http', '$interval', function(scope, http, interval) {
	
	var tPromise = null;
	var mPromise = null;
	
	scope.genThumb = function() {
		http.post("../resources/admin/thumb").
		success(function(data, status, header, config) {
			tPromise = interval(function() {
				getThumbProgress();
			}, 1000);
		});
	};
	
	function getThumbProgress() {
		http.get("../resources/admin/thumb/progress").
		success(function(data, status, header, config) {
			scope.thumbProgress = data / 10;
			if ((data >= 1000) && (tPromise != null)) {
				interval.cancel(tPromise);
				tPromise = null;
			}
		}).
		error(function(data, status, header, config) {
		});
	}
	
	scope.genMeta = function() {
		http.post("../resources/admin/meta").
		success(function(data, status, header, config) {
			mPromise = interval(function() {
				getMetaProgress();
			}, 1000);
		});
	};
	
	function getMetaProgress() {
		http.get("../resources/admin/meta/progress").
		success(function(data, status, header, config) {
			scope.metaProgress = data / 10;
			if ((data >= 1000) && (mPromise != null)) {
				interval.cancel(mPromise);
				mPromise = null;
			}
		}).
		error(function(data, status, header, config) {
		});
	}
	
	scope.migrateMeta = function() {
		http.post("../resources/admin/migration").
		success(function(data, status, header, config) {
			mPromise = interval(function() {
				getMigrateProgress();
			}, 1000);
		});
	};
	
	function getMigrateProgress() {
		http.get("../resources/admin/migration/progress").
		success(function(data, status, header, config) {
			scope.migrateProgress = data / 10;
			if ((data >= 1000) && (mPromise != null)) {
				interval.cancel(mPromise);
				mPromise = null;
			}
		}).
		error(function(data, status, header, config) {
		});
	}
	
	scope.putTags = function() {
		http.post("../resources/admin/tags").
		success(function(data, status, header, config) {
			window.alert("tag set")
		});
	};
	
	scope.setTmp = function() {
		http.post("../resources/admin/tmp").
		success(function(data, status, header, config) {
			window.alert("tmp set")
		});
	};
	
}]);
