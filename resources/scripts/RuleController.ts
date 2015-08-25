interface UrlParams
{
    version: string;
    ruleId: string;
}
interface Rule {
    Key: string;
    Title: string;
    Description: string;
    Tags: string;
}

module Controllers {
    export class RuleController {
        defaultVersion: string;

        constructor(defaultVersion: string) {
            this.defaultVersion = defaultVersion;
            var hash: UrlParams = {
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

        private handleSidebarResizing() {
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
                })
            });
            $(document).mouseup(function (e) {
                $(document).unbind('mousemove');
            });
        }

        public openRequestedPage(hash: UrlParams) {
            if (!hash.version) {
                this.handleVersionError();
                return;
            }

            var requestedVersion = hash.version;

            if (!(new RegExp(<any>/^([a-zA-Z0-9-\.]+)$/)).test(requestedVersion)) {
                this.handleVersionError();
                return;
            }

            //display page:
            var self = this;
            this.getContentsForVersion(requestedVersion, () => {
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
        }

        private parseHash(): any
        {
            var hash = (location.hash || '').replace(/^#/, '').split('&'),
                parsed = {};

            for (var i = 0, el; i < hash.length; i++) {
                el = hash[i].split('=')
                parsed[el[0]] = el[1];
            }
            return parsed;
        }

        private displayMenu(hash: UrlParams) {
            var menu = document.getElementById("rule-menu");
            var currentVersion = menu.getAttribute("data-version");

            if (currentVersion == this.currentVersion)
            {
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
        }

        private displayMainPage() {
            var doc = document.documentElement;
            var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);

            document.getElementById("content").innerHTML = this.currentDefaultContent;

            window.scrollTo(left, 0);
            return;
        }

        private displayRulePage(hash: UrlParams) {
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
        }

        private handleRuleIdError(hasMenuIssueToo: boolean) {
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
        }
        private handleVersionError() {
            this.handleRuleIdError(true);

            var menu = document.getElementById("rule-menu");
            menu.innerHTML = "";
            menu.setAttribute("data-version", "");

            var ruleId = document.getElementById("rule-id");
            ruleId.innerHTML = "ERROR: couldn't find version";
            ruleId.style.visibility = 'visible';
        }

        public hashChanged()
        {
            var hash: UrlParams = {
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
        }

        currentVersion: string;
        currentRules: Rule[];
        currentDefaultContent: string;
        private getContentsForVersion(version: string, callback: Function)
        {
            if (this.currentVersion != version)
            {
                var numberOfCompletedRequests = 0;
                var self = this;
                //load file
                this.getFile('../rules/' + version + '/rules.json', (jsonString) => {
                    self.currentVersion = version;
                    self.currentRules = JSON.parse(jsonString);
                    numberOfCompletedRequests++;
                    if (numberOfCompletedRequests == 2) {
                        callback();
                    }
                });
                this.getFile('../rules/' + version + '/index.html', (data) => {
                    self.currentDefaultContent = data;
                    numberOfCompletedRequests++;
                    if (numberOfCompletedRequests == 2) {
                        callback();
                    }
                });
                return;
            }

            callback();
        }

        private getFile(path: string, callback: Function) {
            var self = this;
            this.loadFile(path, (data) => {
                callback(data);
            });
        }

        private loadFile(path: string, callback: Function) {
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
        }
    }
}
