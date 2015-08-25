var Controllers;
(function (Controllers) {
    var RuleController = (function () {
        function RuleController(defaultVersion) {
            this.defaultVersion = defaultVersion;
            var hash = {
                version: this.defaultVersion,
                ruleId: null
            };
            var parsedHash = this.parseHash();
            if (parsedHash.version) {
                hash.version = parsedHash.version;
            }
            if (parsedHash.ruleId) {
                hash.ruleId = parsedHash.ruleId;
            }
            this.openRequestedPage(hash);
            this.handleSidebarResizing();
        }
        RuleController.prototype.handleSidebarResizing = function () {
            var min = 150;
            var max = 750;
            var mainmin = 200;
            $('#sidebar-resizer').mousedown(function (e) {
                e.preventDefault();
                $(document).mousemove(function (e) {
                    e.preventDefault();
                    var x = e.pageX - $('#sidebar').offset().left;
                    if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {
                        $('#sidebar').css("width", x);
                        $('#content').css("margin-left", x);
                    }
                });
            });
            $(document).mouseup(function (e) {
                $(document).unbind('mousemove');
            });
        };
        RuleController.prototype.openRequestedPage = function (hash) {
            if (!hash.version) {
                this.handleVersionError();
                return;
            }
            var requestedVersion = hash.version;
            if (!(new RegExp(/^([a-zA-Z0-9-\.]+)$/)).test(requestedVersion)) {
                this.handleVersionError();
                return;
            }
            //display page:
            var self = this;
            this.getContentsForVersion(requestedVersion, function () {
                self.displayMenu(hash);
                if (!hash.ruleId) {
                    self.displayMainPage();
                    document.title = 'SonarLint for Visual Studio - Version ' + hash.version;
                }
                else {
                    self.displayRulePage(hash);
                    document.title = 'SonarLint for Visual Studio - Rule ' + hash.ruleId;
                }
            });
        };
        RuleController.prototype.parseHash = function () {
            var hash = (location.hash || '').replace(/^#/, '').split('&'), parsed = {};
            for (var i = 0, el; i < hash.length; i++) {
                el = hash[i].split('=');
                parsed[el[0]] = el[1];
            }
            return parsed;
        };
        RuleController.prototype.displayMenu = function (hash) {
            var menu = document.getElementById("rule-menu");
            var currentVersion = menu.getAttribute("data-version");
            if (currentVersion == this.currentVersion) {
                return;
            }
            var listItems = '';
            for (var i = 0; i < this.currentRules.length; i++) {
                listItems += '<li><a href="#version=' + this.currentVersion + '&ruleId=' + this.currentRules[i].Key + '" title="' + this.currentRules[i].Title + '">' + this.currentRules[i].Title + '</a></li>';
            }
            document.getElementById("rule-version").innerHTML =
                '<a href="index.html#version=' + this.currentVersion + '" >in version ' + this.currentVersion + '</a>';
            menu.innerHTML = listItems;
            menu.setAttribute("data-version", this.currentVersion);
        };
        RuleController.prototype.displayMainPage = function () {
            var doc = document.documentElement;
            var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            document.getElementById("content").innerHTML = this.currentDefaultContent;
            window.scrollTo(left, 0);
            return;
        };
        RuleController.prototype.displayRulePage = function (hash) {
            var doc = document.documentElement;
            var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            for (var i = 0; i < this.currentRules.length; i++) {
                if (this.currentRules[i].Key == hash.ruleId) {
                    //we have found it
                    var ruleId = document.getElementById("rule-id");
                    ruleId.innerHTML = 'Rule ID: ' + this.currentRules[i].Key;
                    ruleId.style.visibility = 'visible';
                    document.getElementById("rule-title").innerHTML = this.currentRules[i].Title;
                    var tags = document.getElementById("rule-tags");
                    tags.innerHTML = this.currentRules[i].Tags;
                    if (this.currentRules[i].Tags) {
                        tags.style.visibility = 'visible';
                    }
                    else {
                        tags.style.visibility = 'hidden';
                    }
                    document.getElementById("rule-description").innerHTML = this.currentRules[i].Description;
                    window.scrollTo(left, 0);
                    return;
                }
            }
            this.handleRuleIdError(false);
        };
        RuleController.prototype.handleRuleIdError = function (hasMenuIssueToo) {
            if (!hasMenuIssueToo) {
                var ruleId = document.getElementById("rule-id");
                ruleId.innerHTML = "ERROR: couldn't find rule";
                ruleId.style.visibility = 'visible';
            }
            document.getElementById("rule-title").innerHTML = "";
            var tags = document.getElementById("rule-tags");
            tags.innerHTML = "";
            tags.style.visibility = 'hidden';
            document.getElementById("rule-description").innerHTML = "";
        };
        RuleController.prototype.handleVersionError = function () {
            this.handleRuleIdError(true);
            var menu = document.getElementById("rule-menu");
            menu.innerHTML = "";
            menu.setAttribute("data-version", "");
            var ruleId = document.getElementById("rule-id");
            ruleId.innerHTML = "ERROR: couldn't find version";
            ruleId.style.visibility = 'visible';
        };
        RuleController.prototype.hashChanged = function () {
            var hash = {
                version: this.defaultVersion,
                ruleId: null
            };
            var parsedHash = this.parseHash();
            if (parsedHash.version) {
                hash.version = parsedHash.version;
            }
            if (parsedHash.ruleId) {
                hash.ruleId = parsedHash.ruleId;
            }
            this.openRequestedPage(hash);
        };
        RuleController.prototype.getContentsForVersion = function (version, callback) {
            if (this.currentVersion != version) {
                var numberOfCompletedRequests = 0;
                var self = this;
                //load file
                this.getFile('../rules/' + version + '/rules.json', function (jsonString) {
                    self.currentVersion = version;
                    self.currentRules = JSON.parse(jsonString);
                    numberOfCompletedRequests++;
                    if (numberOfCompletedRequests == 2) {
                        callback();
                    }
                });
                this.getFile('../rules/' + version + '/index.html', function (data) {
                    self.currentDefaultContent = data;
                    numberOfCompletedRequests++;
                    if (numberOfCompletedRequests == 2) {
                        callback();
                    }
                });
                return;
            }
            callback();
        };
        RuleController.prototype.getFile = function (path, callback) {
            var self = this;
            this.loadFile(path, function (data) {
                callback(data);
            });
        };
        RuleController.prototype.loadFile = function (path, callback) {
            var self = this;
            var xobj = new XMLHttpRequest();
            xobj.open('GET', path, true);
            xobj.onload = function () {
                if (this.status == 200) {
                    callback(xobj.responseText);
                }
                else {
                    self.handleVersionError();
                }
            };
            xobj.send(null);
        };
        return RuleController;
    })();
    Controllers.RuleController = RuleController;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=RuleController.js.map