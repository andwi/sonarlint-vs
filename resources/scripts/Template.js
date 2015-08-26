var Template = (function () {
    function Template() {
    }
    Template.init = function () {
        Handlebars.registerHelper('rule-tags-visibility', function (tags) {
            if (!tags) {
                return 'visibility: hidden;';
            }
            return '';
        });
        Template.RuleMenuItem = Handlebars.compile(Template.RuleMenuItem);
        Template.RuleMenuHeaderVersion = Handlebars.compile(Template.RuleMenuHeaderVersion);
        Template.RuleMenuHeaderVersionError = Handlebars.compile(Template.RuleMenuHeaderVersionError);
        Template.RulePageContent = Handlebars.compile(Template.RulePageContent);
        Template.RuleErrorPageContent = Handlebars.compile(Template.RuleErrorPageContent);
        Template.RuleFilterElement = Handlebars.compile(Template.RuleFilterElement);
    };
    Template.eval = function (template, context) {
        return template(context);
    };
    Template.RuleMenuItem = '<li><a  class="rule-link" href="#version={{currentVersion}}&ruleId={{rule.Key}}" title="{{rule.Title}}">{{rule.Title}}</a></li>';
    Template.RuleMenuHeaderVersion = '<h2>List of rules</h2><span id="rule-version"><a class="rule-link" href="#version={{currentVersion}}">in version {{currentVersion}}</span></a>';
    Template.RuleMenuHeaderVersionError = '<span id="rule-version"><a href="#">Go to latest version</span></a>';
    Template.RulePageContent = ('<div class="rule-details">' +
        '<div class="rule-meta">' +
        '<h1 id="rule-title">{{Title}}</h1>' +
        '<span id="rule-id" class="id">Rule ID: {{Key}}</span>' +
        '<div class="rules-detail-properties">' +
        '<span class="tags" id="rule-tags" style="{{{rule-tags-visibility Tags}}}">{{Tags}}</span>' +
        '</div>' +
        '</div>' +
        '<div class="rule-description" id="rule-description">{{{Description}}}</div>' +
        '</div>');
    Template.RuleErrorPageContent = ('<div class="rule-details">' +
        '<div class="rule-meta">' +
        '<h1 id="rule-title">Error</h1>' +
        '<span id="rule-id" class="id">{{message}}</span>' +
        '</div>' +
        '</div>');
    Template.RuleFilterElement = '<li><input type="checkbox" checked="checked" id="{{tag}}" /><label for="{{tag}}">{{tag}}</label></li>';
    Template.hack_static_run = Template.init();
    return Template;
})();
//# sourceMappingURL=Template.js.map