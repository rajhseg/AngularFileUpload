
var rgapp = angular.module('rgapp', ['angularFileUpload']);

rgapp.controller('blogcontroller', ['$scope', '$upload', function ($scope, $upload) {

    $scope.Files = [];
    $scope.FilesData = [];
    $scope.filedata = { trackingid: '', description: '' };

    $scope.success = function (data, status, headers, config) {
        console.log('config');
        console.log(config);
        $scope.FilesData.push(data);
    }

    $scope.error = function (data, status, headers, config) {
        console.log('error');
        console.log(config);
    }

    $scope.uploadfiles = function (files) {
        console.log("Files select callback");
        console.log(files);
    }

    $scope.uploadedFiles = function (files) {
        $scope.Files = files;
    }

}]);

rgapp.filter('ellipses', function () {
    return function (value, max, tail) {
        if (!value)
            return "";
                
        max = parseInt(max, 10);

        if (!max)
            return value;

        if (value.length <= max)
            return value;

        value = value.substr(0, max);
        return value + (tail || '...');

    }
});

rgapp.directive('progressWidth', [function () {
    return {
        restrict: 'A',
        scope: {
            progressWidth: '='
        },
        link: function (scope, elem, attr, cntrl) {

            var width = (elem.prop('offsetWidth') * scope.progressWidth) / 100;
            angular.element(elem.find('div')).css('width', width + 'px');

            scope.$watch(function () { return scope.progressWidth; }, function (newval, oldval) {
                if (newval != oldval) {
                    var width = (elem.prop('offsetWidth') * scope.progressWidth) / 100;
                    if (scope.progressWidth == 100)
                        width = width - 3;
                    angular.element(elem.find('div')).css('width', width + 'px');
                }
            });
        }
    }
}]);

rgapp.directive('dropfile', function () {
    return {
        scope: {
            browse: '&',
            config: '='
        },
        templateUrl:'../App/templates/filedrop.html',
        restrict: 'E',
        link: function (scope, element, attr, cntrl) {

            if (scope.config) {
                if (!scope.config.width) {

                }
            }

            element.on('dragover', function (e) {                                      
                e.preventDefault();
                e.stopPropagation();
            });

            element.on('dragenter', function (e) {            
                e.preventDefault();
                e.dataTransfer.dropEffect = "Copy";               
                e.stopPropagation();
            });

            element.on('drop', function (e) {             
                e.preventDefault();
                e.stopPropagation();                
                scope.browse({ files: e.dataTransfer.files })
            });

        }

    }
});

rgapp.directive('fileuploadForm', ['$upload', function ($upload) {
    return {
        scope: {
            asyncurl: '@',
            successCallback: '&',
            fileselectCallback: '&',
            errorCallback: '&',
            inputData: '='
        },
        restrict: 'E',
        templateUrl: '../App/templates/upload.html',
        link: function (scope, element, attr, cntrl) {

            scope.dropcontainerEnable = false;

            scope.dropcontainerEnable = attr.filedropEnable;

            function guid() {
                function uid() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return uid() + uid() + '-' + uid() + '-' + uid() + '-' +
                    uid() + '-' + uid() + uid() + uid();
            }

            scope.progressFiles = [];
            var uploadingFiles = [];
            var uploadFileHandlers = [];

            scope.uploadedFilesString = '';
            scope.uploadinProgress = false;
            scope.uploadProgressCount = 0;

            scope.$watch('uploadProgressCount', function (newval, oldval) {
                if (newval < oldval) {
                    if (newval == 0) {
                        scope.uploadinProgress = false;
                    }
                }
            });

            scope.findlastindex = function (unique) {
                for (var i = 0; i < scope.progressFiles.length; i++) {
                    if (scope.progressFiles[i].uniqueid == unique) {
                        return i;
                    }
                }
            }

            scope.uploading = function () {

                if (uploadingFiles.length == 0) {
                    alert("please select any files to upload");
                    return;
                }

                scope.uploadinProgress = true;

                for (var i = 0; i < uploadingFiles.length; i++) {

                    if (scope.progressFiles[i].isshow) {

                        scope.uploadProgressCount++;

                        var _file = uploadingFiles[i];
                        scope.progressFiles[i].isabort = false;
                        scope.progressFiles[i].isfinished = false;
                        var uniqueid = scope.progressFiles[i].uniqueid;

                        (function (uid,indx) {

                            
                            scope.progressFiles[i].isprogress = true;

                            uploadFileHandlers[indx] = $upload.upload({
                                url: attr.asyncurl,
                                method: 'POST',
                                file: _file,
                                data: scope.inputData
                            })
                                .progress(function (prg) {
                                    var uindex = scope.findlastindex(uid);
                                    if (prg.total != 0) {
                                        scope.progressFiles[uindex].progress = Math.round((prg.loaded * 100) / prg.total);
                                    }
                                })
                                .success(function (data, status, headers, config) {
                                    var uindex = scope.findlastindex(uid);
                                    scope.progressFiles[uindex].isprogress = false;
                                    scope.progressFiles[uindex].isfinished = true;
                                    scope.uploadProgressCount--;
                                    if (scope.successCallback)
                                        scope.successCallback({ data: data, status: status, headers: headers, config: config });

                                })
                                .error(function (data, status, headers, config) {
                                    scope.uploadProgressCount--;
                                    var uindex = scope.findlastindex(uid);
                                    if (!scope.progressFiles[uindex].isabort) {
                                        scope.progressFiles[uindex].isprogress = false;
                                        scope.progressFiles[uindex].isfinished = false;

                                        scope.progressFiles[uindex].iserror = true;
                                        scope.progressFiles[uindex].error = data;

                                        if (scope.errorCallback)
                                            scope.errorCallback({ data: data, status: status, headers: headers, config: config });

                                    }


                                });

                        })(uniqueid,i);

                    }
                }
                uploadingFiles = [];
                scope.uploadedFilesString = '';
            }

            scope.abort = function (indx) {

                scope.progressFiles[indx].isabort = true;
                scope.progressFiles[indx].isprogress = false;
                scope.progressFiles[indx].iserror = false;

                if (uploadFileHandlers.length > indx) {
                    uploadFileHandlers[indx].abort();                   
                }                                                                            
            }
          
            scope.close = function (indx) {
                scope.progressFiles[indx].isshow = false;

                if (uploadingFiles.length > indx)
                  uploadingFiles.splice(indx, 1);

                if (scope.progressFiles[indx].isprogress ) {
                    uploadFileHandlers[indx].abort();
                    uploadFileHandlers.splice(indx, 1);
                }
                else if (scope.progressFiles[indx].isfinished) {
                    uploadFileHandlers.splice(indx, 1);
                }
                scope.progressFiles.splice(indx, 1);
                scope.reindexing();
            }

            scope.reindexing = function () {
                scope.uploadedFilesString = "";
                for (var i = 0; i < scope.progressFiles.length; i++) {
                    scope.progressFiles[i].index = i;

                    if (!scope.progressFiles[i].isabort && !scope.progressFiles[i].isprogress && !scope.progressFiles[i].isfinished && !scope.progressFiles[i].iserror)
                        scope.uploadedFilesString += scope.progressFiles[i].filename + ";";                
                }
            }

            scope.dropfiles = function (files) {
                var tempfiles = [];
                for (var i = 0; i < files.length; i++) {
                    tempfiles[i] = files[i];
                }
                scope.uploadedFiles(tempfiles);
                tempfiles = [];
                scope.$apply();
            }

            scope.uploadedFiles = function (files) {
                uploadingFiles = files;
                scope.progressFiles = [];
                scope.uploadedFilesString = '';
                for (var i = 0; i < uploadingFiles.length; i++) {

                    scope.uploadedFilesString += uploadingFiles[i].name + ";";

                    scope.progressFiles[i] = {
                        uniqueid: guid(),
                        iserror: false,
                        error: '', isshow: true,
                        isprogress: false,
                        index: i,
                        isabort: false,
                        isfinished: false,
                        extn: '', filecolor: '',
                        filename: uploadingFiles[i].name,
                        size: uploadingFiles[i].size,
                        progress: 0, type:
                        uploadingFiles[i].type
                    };
                    scope.progressFiles[i].extn = scope.progressFiles[i].filename.substr(scope.progressFiles[i].filename.lastIndexOf('.') + 1);
                    scope.progressFiles[i].filecolor = scope.getExtensionFile(scope.progressFiles[i].extn);

                }

                if (scope.fileselectCallback)
                    scope.fileselectCallback({ files: files });
            }

            scope.browseFiles = function () {                
                element.find("input")[1].click()
            }

            scope.getExtensionFile = function (extn) {
                switch (extn) {
                    case "jpg":
                    case "png":
                    case "bmp":
                        return "#7b8c25";
                        break;
                    case "xls":
                    case "xlsx":
                    case "csv":
                        return "#468847";
                        break;
                    case "doc":
                    case "docx":
                        return "#428bca";
                        break;
                    case "ini":
                    case "jar":
                    case "zip":
                        return "#773472";
                        break;
                    case "exe":
                        return "#bce8f1";
                        break;
                    default:
                        return "red";
                }
            }

        }
    }
}]);


